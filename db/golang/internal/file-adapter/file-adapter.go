package file_adapter

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
)

type FileAdapter struct {
	filename      string
	indexFileName string
	mutex         sync.Mutex
}

func NewAdapter(dir string) *FileAdapter {

	filename := filepath.Join(dir, "samuraidb")
	indexFileName := filepath.Join(dir, "index.txt")

	// Проверка или создание директории
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		log.Fatalf("Failed to create directory: %v", err)
	}

	return &FileAdapter{filename: filename, indexFileName: indexFileName}
}

func (fa *FileAdapter) Set(key string, currentSegment int, data []byte) (int64, error) {
	fa.mutex.Lock()
	defer fa.mutex.Unlock()

	entry := fmt.Sprintf("%s,%s\n", key, string(data))

	fileName := fa.getSegmentFileName(currentSegment)

	file, err := os.OpenFile(fileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	offset, err := file.Seek(0, io.SeekEnd)
	if err != nil {
		return 0, err
	}

	_, err = file.WriteString(entry)
	if err != nil {
		return 0, err
	}

	return offset, nil
}

func (fa *FileAdapter) Get(offset int64) (map[string]any, error) {
	if offset < 0 {
		return nil, fmt.Errorf("Offset must be passed")
	}

	file, err := os.Open(fa.filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	_, err = file.Seek(offset, io.SeekStart)
	if err != nil {
		return nil, err
	}

	buffer := make([]byte, 1024)
	n, err := file.Read(buffer)
	if err != nil {
		return nil, err
	}

	line := string(buffer[:n])
	_, storedValue, _ := parseEntry(line)

	var value map[string]any
	err = json.Unmarshal([]byte(storedValue), &value)
	if err != nil {
		return nil, err
	}
	return value, nil
}

func (fa *FileAdapter) SaveIndex(indexMap map[string]int64) error {
	fa.mutex.Lock()
	defer fa.mutex.Unlock()

	serializedMap, err := json.Marshal(indexMap)
	if err != nil {
		return fmt.Errorf("unable to serialize the data in SaveIndex: %w", err)
	}
	return os.WriteFile(fa.indexFileName, serializedMap, 0644)
}

func (fa *FileAdapter) ReadIndex() (map[string]int64, error) {
	fileContent, err := os.ReadFile(fa.indexFileName)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return make(map[string]int64), nil
		}
		return nil, err
	}

	var index map[string]int64
	err = json.Unmarshal(fileContent, &index)
	if err != nil {
		return nil, err
	}

	return index, nil
}

func (fa *FileAdapter) GetFileSize(segmentNumber int) (int64, error) {
	fileName := fa.getSegmentFileName(segmentNumber)
	fileInfo, err := os.Stat(fileName)
	if err != nil {
		slog.Info("file data retrieval error", slog.Any("error: ", err))
		return 0, err
	}

	return fileInfo.Size(), nil
}

func (fa *FileAdapter) getSegmentFileName(segmentNumber int) string {
	fn := strings.Builder{}
	fn.WriteString(fa.filename)
	fn.WriteString("_segment_")
	fn.WriteString(strconv.Itoa(segmentNumber))
	fn.WriteString(".txt")
	return fn.String()
}

// Helper functions
func serializeData(data any) string {
	b, _ := json.Marshal(data)
	return string(b)
}

func parseEntry(line string) (string, string, error) {
	res := strings.SplitN(line, ",", 2)
	if len(res) < 2 {
		return "", "", fmt.Errorf("Invalid entry format")
	}

	return res[0], res[1], nil
}

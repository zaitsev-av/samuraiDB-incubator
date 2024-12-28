package segment_manager

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"sync"
)

type FileAdapterInterface interface {
	GetFileSize(segmentNumber int64) (int64, error)
	Set(key string, currentSegment int64, data []byte) (int64, error)
	Get(offset int64, segment int64) (map[string]any, error)
}

type SegmentManager struct {
	adapter        FileAdapterInterface
	size           int64
	currentSegment int64
	mu             sync.Mutex
}

func NewSegmentManager(adapter FileAdapterInterface, size int64) *SegmentManager {
	return &SegmentManager{adapter: adapter, size: size, currentSegment: 0}
}

func (s *SegmentManager) Set(key string, data any) (offset int64, segment int64, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	size, err := s.adapter.GetFileSize(s.currentSegment)
	if err != nil {
		slog.Error("file data retrieval error", slog.Any("error: ", err), slog.Int64("current segment: ", s.currentSegment))
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		slog.Info("failed serialize data", slog.Any("error: ", err))
		return 0, 0, fmt.Errorf("failed to serialize data: %w", err)
	}

	if size+int64(len(bytes)) > s.size {
		s.currentSegment++
	}

	offset, err = s.adapter.Set(key, s.currentSegment, bytes)
	if err != nil {
		slog.Info("failed set in segment manager", slog.String("key: ", key), slog.Int64("current segment: ", s.currentSegment))
		return 0, 0, fmt.Errorf("failed to set data: %w", err)
	}
	return offset, s.currentSegment, nil
}

func (s *SegmentManager) Get(offset int64, segment int64) (map[string]any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	data, err := s.adapter.Get(offset, segment)
	if err != nil {
		slog.Info("data reading error ", slog.Any("error", err), slog.Int64("offset: ", offset), slog.Int64("segment: ", segment))
		return nil, fmt.Errorf("failed to get data: %w", err)
	}
	return data, nil
}

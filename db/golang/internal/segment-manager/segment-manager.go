package segment_manager

import (
	"encoding/json"
	"log/slog"
	fa "samurai-db/internal/file-adapter"
	"sync"
)

type SegmentManager struct {
	adapter        *fa.FileAdapter
	size           int
	currentSegment int
	mu             sync.Mutex
}

func NewSegmentManager(adapter *fa.FileAdapter, size int) *SegmentManager {
	return &SegmentManager{adapter: adapter, size: size, currentSegment: 0}
}

func (s *SegmentManager) Set(key string, data any) (offset int64, segment int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	size, err := s.adapter.GetFileSize(s.currentSegment)
	if err != nil {
		slog.Info("file data retrieval error", slog.Any("error: ", err))
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		slog.Info("failed serialize data", slog.Any("error: ", err))
	}

	if size+int64(len(bytes)) > int64(s.size) {
		s.currentSegment++
	}

	offset, err = s.adapter.Set(key, s.currentSegment, bytes)
	if err != nil {
		slog.Info("failed set data to file", slog.Any("error: ", err))
	}
	return offset, s.currentSegment
}

func (s *SegmentManager) Get(offset int64, segment int) map[string]any {
	s.mu.Lock()
	defer s.mu.Unlock()
	data, err := s.adapter.Get(offset, segment)
	if err != nil {
		slog.Info("data reading error ", slog.Any("error", err))
	}
	return data
}

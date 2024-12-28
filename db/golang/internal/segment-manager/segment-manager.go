package segment_manager

import fa "samurai-db/internal/file-adapter"

type SegmentManager struct {
	adapter        *fa.FileAdapter
	size           int
	currentSegment int
}

func NewSegmentManager(adapter *fa.FileAdapter, size int) *SegmentManager {
	return &SegmentManager{adapter: adapter, size: size, currentSegment: 0}
}

func (s *SegmentManager) Set(key string, data any) any {
	return nil
}

func initCurrentSegment() int {
	return 0
}

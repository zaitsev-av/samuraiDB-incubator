package index_manager

import (
	"samurai-db/common"
	fa "samurai-db/internal/file-adapter"
)

type IndexManager struct {
	index       map[string]*common.IndexMap
	fileAdapter *fa.FileAdapter
}

func NewIndexManager(fa *fa.FileAdapter) *IndexManager {
	return &IndexManager{fileAdapter: fa}
}

func (im *IndexManager) Init() error {
	index, err := im.fileAdapter.ReadIndex()
	if err != nil {
		return err
	}
	im.index = make(map[string]*common.IndexMap)
	for key, value := range index {
		im.index[key] = &value
	}
	return nil
}

func (im *IndexManager) SetIndexEntry(key string, offset int64, segment int) error {
	im.index[key] = &common.IndexMap{
		Offset:  offset,
		Segment: segment,
	}
	return im.fileAdapter.SaveIndex(im.index)
}

func (im *IndexManager) GetIndexEntry(key string) (*common.IndexMap, bool) {
	entry, exists := im.index[key]
	return entry, exists
}

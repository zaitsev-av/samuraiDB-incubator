package samuraidb

import (
	im "samurai-db/internal/index-manager"
	sm "samurai-db/internal/segment-manager"
)

type SamuraiDB struct {
	segmentManager *sm.SegmentManager
	indexManager   *im.IndexManager
}

func NewSamuraiDB(segmentManager *sm.SegmentManager, indexManager *im.IndexManager) *SamuraiDB {
	return &SamuraiDB{segmentManager: segmentManager, indexManager: indexManager}
}

func (db *SamuraiDB) Init() error {
	return db.indexManager.Init()
}

func (db *SamuraiDB) Set(key string, data any) error {
	offset, segment, err := db.segmentManager.Set(key, data)
	if err != nil {
		return err
	}

	return db.indexManager.SetIndexEntry(key, offset, segment)
}

func (db *SamuraiDB) Get(key string) (any, error) {
	index, exists := db.indexManager.GetIndexEntry(key)
	if !exists {
		return nil, nil // Key not found
	}
	test, err := db.segmentManager.Get(index.Offset, index.Segment)
	if err != nil {
		return nil, err
	}
	return test, nil
}

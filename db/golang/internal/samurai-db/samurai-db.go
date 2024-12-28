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

func (db *SamuraiDB) Set(key string, data interface{}) error {
	offset, _ := db.segmentManager.Set(key, data)
	//todo refactor
	//if err != nil {
	//	return err
	//}
	return db.indexManager.SetOffset(key, offset)
}

func (db *SamuraiDB) Get(key string) (interface{}, error) {
	//offset, exists := db.indexManager.GetOffset(key)
	_, exists := db.indexManager.GetOffset(key)
	if !exists {
		return nil, nil // Key not found
	}
	test, _ := db.segmentManager.Set("", "")
	return test, nil
}

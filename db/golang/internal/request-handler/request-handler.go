package request_handler

import (
	"fmt"
	"github.com/google/uuid"
	"samurai-db/common"
	sdb "samurai-db/internal/samurai-db"
	"strings"
)

const (
	Get = "GET"
	Set = "SET"
)

type RequestHandler struct {
	db *sdb.SamuraiDB
}

func NewRequestHandler(db *sdb.SamuraiDB) *RequestHandler {
	return &RequestHandler{
		db: db,
	}
}

func (rh *RequestHandler) Handle(requestAction common.RequestAction) (response any, err error) {
	switch strings.ToUpper(requestAction.Type) {
	case Set:
		return rh.handleSet(requestAction)
	case Get:
		return rh.handleGet(requestAction)
	default:
		return nil, fmt.Errorf("unknown request type: %s", requestAction.Type)
	}
}

func (rh *RequestHandler) handleSet(a common.RequestAction) (map[string]any, error) {
	id := uuid.New().String()
	a.Payload["id"] = id

	if err := rh.db.Set(id, a.Payload); err != nil {
		return nil, fmt.Errorf("failed to Set value: %w", err)
	}

	response := map[string]any{
		"id":   id,
		"uuid": a.UUID,
	}
	for k, v := range a.Payload {
		response[k] = v
	}
	return response, nil
}

func (rh *RequestHandler) handleGet(a common.RequestAction) (map[string]any, error) {
	id, ok := a.Payload["id"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid id format")
	}

	data, err := rh.db.Get(id)
	if err != nil || data == nil {
		return nil, fmt.Errorf("data not found")
	}

	response := map[string]any{}
	if payload, ok := data.(map[string]any); ok {
		for k, v := range payload {
			response[k] = v
		}
	}
	return response, nil
}

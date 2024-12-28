package common

type IndexMap struct {
	Offset  int64 `json:"offset"`
	Segment int64 `json:"segment"`
}

type RequestAction struct {
	Type    string         `json:"type"`
	Payload map[string]any `json:"payload"`
	UUID    string         `json:"uuid"`
}

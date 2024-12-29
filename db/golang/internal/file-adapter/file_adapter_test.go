package file_adapter

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"os"
	"path/filepath"
	"samurai-db/common"
	"strconv"
	"strings"
	"testing"
)

func TestNewAdapter(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	assert.Equal(t, filepath.Join(dir, "samuraidb.txt"), adapter.filename)
	assert.Equal(t, filepath.Join(dir, "index.txt"), adapter.indexFileName)
}

func TestFileAdapter_SetAndGet(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	key := "exampleKey"
	segment := int64(0)
	value := map[string]any{"name": "Samurai"}
	data, err := json.Marshal(value)
	offset, err := adapter.Set(key, segment, data)

	assert.NoError(t, err)
	assert.GreaterOrEqual(t, offset, int64(0))

	readValue, err := adapter.Get(offset, segment)
	assert.NoError(t, err)
	assert.NoError(t, err)
	assert.Equal(t, value, readValue)
}

func TestFileAdapter_SaveAndReadIndex(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	value := map[string]*common.IndexMap{
		"qwe-123rty-12": {Offset: int64(123), Segment: int64(0)},
	}
	err := adapter.SaveIndex(value)

	assert.NoError(t, err)

	readIndex, err := adapter.ReadIndex()

	assert.NoError(t, err)
	assert.Equal(t, value, readIndex)

	value = map[string]*common.IndexMap{}
	err = adapter.SaveIndex(value)

	assert.NoError(t, err)

	readIndex, err = adapter.ReadIndex()

	assert.NoError(t, err)
	assert.Equal(t, value, readIndex)
}

func TestFileAdapter_GetInvalidOffset(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	_, err := adapter.Get(int64(1), int64(0))
	assert.Error(t, err)
	assert.Equal(t, "Offset must be passed", err.Error())
}

func TestFileAdapter_TestParseEntry(t *testing.T) {

	line := "key,{value: 1231, value1: 'bla-bla'}"
	key, value, err := parseEntry(line)
	assert.NoError(t, err)
	assert.Equal(t, "key", key)
	assert.Equal(t, "{value: 1231, value1: 'bla-bla'}", value)

	line = ""
	_, _, err = parseEntry(line)
	assert.Error(t, err)

	line = "asdfhjklljh"
	_, _, err = parseEntry(line)
	assert.Error(t, err)
}

func TestFileAdapter_GetSegmentName(t *testing.T) {
	dir := "test"
	sn := int64(99)
	adapter := NewAdapter(dir)
	builder := strings.Builder{}
	builder.WriteString(adapter.filename)
	builder.WriteString("_segment_")
	builder.WriteString(strconv.Itoa(int(sn)))
	builder.WriteString(".txt")
	resultStr := builder.String()

	res := adapter.getSegmentFileName(sn)
	t.Logf("Input: %s, Output: %s", resultStr, res)
	assert.Equal(t, resultStr, res)
}

func TestFileAdapter_GetFileSize(t *testing.T) {
	dir := "test"
	sn := int64(99)
	adapter := NewAdapter(dir)
	testFileName := adapter.getSegmentFileName(sn)

	testFileContent := []byte("This is a test file.")
	err := os.WriteFile(testFileName, testFileContent, 0644)

	require.NoError(t, err)

	fileSize, err := adapter.GetFileSize(sn)
	require.NoError(t, err)

	t.Logf("expected: %d, actual: %d", int64(len(testFileContent)), fileSize)
	assert.Equal(t, int64(len(testFileContent)), fileSize)
}

func TestGetFileSize_FileNotFound(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	size, err := adapter.GetFileSize(999)
	require.Error(t, err)
	assert.Equal(t, int64(0), size)
}

package file_adapter

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"os"
	"path/filepath"
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
	value := map[string]string{"name": "Samurai"}
	offset, err := adapter.Set(key, value)

	assert.NoError(t, err)
	assert.GreaterOrEqual(t, offset, int64(0))

	readValue, err := adapter.Get(offset)
	assert.NoError(t, err)
	assert.NoError(t, err)
	assert.Equal(t, value, readValue)
}

func TestFileAdapter_SaveAndReadIndex(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	value := map[string]int64{"name": 123, "name2": 456}
	err := adapter.SaveIndex(value)

	assert.NoError(t, err)

	readIndex, err := adapter.ReadIndex()

	assert.NoError(t, err)
	assert.Equal(t, value, readIndex)

	value = map[string]int64{}
	err = adapter.SaveIndex(value)

	assert.NoError(t, err)

	readIndex, err = adapter.ReadIndex()

	assert.NoError(t, err)
	assert.Equal(t, value, readIndex)
}

func TestFileAdapter_GetInvalidOffset(t *testing.T) {
	dir := t.TempDir()
	adapter := NewAdapter(dir)

	_, err := adapter.Get(-1)
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
	sn := 99
	adapter := NewAdapter(dir)
	builder := strings.Builder{}
	builder.WriteString(adapter.filename)
	builder.WriteString("_segment_")
	builder.WriteString(strconv.Itoa(sn))
	builder.WriteString(".txt")
	resultStr := builder.String()

	res := adapter.getSegmentFileName(sn)
	t.Logf("Input: %s, Output: %s", resultStr, res)
	assert.Equal(t, resultStr, res)
}

func TestFileAdapter_GetFileSize(t *testing.T) {
	dir := "test"
	sn := 99
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

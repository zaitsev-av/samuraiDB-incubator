package file_adapter

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
)

func parseEntryOld(line string) (string, string, error) {
	i := 0
	for i < len(line) && line[i] != ',' {
		i++
	}
	if i >= len(line) {
		return "", "", fmt.Errorf("Invalid entry format")
	}
	return line[:i], line[i+1:], nil
}

func parseEntryNew(line string) (string, string, error) {
	res := strings.SplitN(line, ",", 2)
	if len(res) < 2 {
		return "", "", fmt.Errorf("Invalid entry format")
	}
	return res[0], res[1], nil
}

func BenchmarkParseEntryOld(b *testing.B) {
	line := "9bd33c6b-e302-4249-b425-796be8e8ece0-796be8e8ece0-796be8e8ece0-796be8e8ece0,{'attackPower':50,'defensePower':30,'health':100,'id':'9bd33c6b-e302-4249-b425-796be8e8ece0','name':'Miyamoto Musashi','weapon':'Katana'}"
	for i := 0; i < b.N; i++ {
		_, _, _ = parseEntryOld(line)
	}
}

func BenchmarkParseEntryNew(b *testing.B) {
	line := "9bd33c6b-e302-4249-b425-796be8e8ece0-796be8e8ece0-796be8e8ece0-796be8e8ece0,{'attackPower':50,'defensePower':30,'health':100,'id':'9bd33c6b-e302-4249-b425-796be8e8ece0','name':'Miyamoto Musashi','weapon':'Katana'}"
	for i := 0; i < b.N; i++ {
		_, _, _ = parseEntryNew(line)
	}
}

func BenchmarkGetSegmentName(b *testing.B) {
	dir := "test"
	sn := 99
	adapter := NewAdapter(dir)
	for i := 0; i < b.N; i++ {
		_ = adapter.getSegmentFileName(int64(sn))
	}
}

func BenchmarkGetSegmentNameConcat(b *testing.B) {
	dir := "test"
	sn := 99
	adapter := NewAdapter(dir)
	res := concatFileName(adapter.filename, sn)
	b.Log(res)
	for i := 0; i < b.N; i++ {
		_ = concatFileName(adapter.filename, sn)
	}
}

func concatFileName(n string, i int) string {
	return n + "_segment_" + strconv.Itoa(i) + "_segment_" + ".txt"
}

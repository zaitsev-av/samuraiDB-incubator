package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"path/filepath"
	"samurai-db/common"
	fa "samurai-db/internal/file-adapter"
	im "samurai-db/internal/index-manager"
	rh "samurai-db/internal/request-handler"
	sdb "samurai-db/internal/samurai-db"
	sm "samurai-db/internal/segment-manager"
)

func main() {
	dir := filepath.Join("db")
	fileAdapter := fa.NewAdapter(dir)
	indexManager := im.NewIndexManager(fileAdapter)
	segmentManager := sm.NewSegmentManager(fileAdapter, 1024)
	db := sdb.NewSamuraiDB(segmentManager, indexManager)

	handler := rh.NewRequestHandler(db)

	// Инициализация базы данных
	if err := db.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Создание TCP сервера
	listener, err := net.Listen("tcp", ":4001")
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
	defer listener.Close()

	log.Println("Server listening on port 4001")

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("Failed to accept connection: %v\n", err)
			continue
		}

		go handleConnection(conn, handler)
	}
}

func handleConnection(conn net.Conn, handler *rh.RequestHandler) {
	defer conn.Close()
	log.Println("Client connected")

	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		data := scanner.Text()
		log.Printf("Received from client: %s", data)

		var requestAction common.RequestAction
		if err := json.Unmarshal([]byte(data), &requestAction); err != nil {
			log.Printf("Failed to parse request: %v", err)
			fmt.Fprintf(conn, "Invalid request format\n")
			continue
		}

		log.Printf("Unmarshal from client: %s", requestAction)

		response, err := handler.Handle(requestAction)
		if err != nil {
			log.Printf("Error handling request: %v", err)
			fmt.Fprintf(conn, "%s\n", err.Error())
			continue
		}

		responseData, _ := json.Marshal(response)
		conn.Write(responseData)
		log.Printf("Response: %s", responseData)
	}
	if err := scanner.Err(); err != nil {
		log.Printf("Client error: %v", err)
	}

	log.Println("Client disconnected")

}

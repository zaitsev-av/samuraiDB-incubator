# SamuraiDB

## Links

- [Full Plan Communication with GPT](https://chatgpt.com/share/66fbb3e3-64dc-8006-9789-be66930200ea)

### Fixes
- [то что не работало, уточняли у чата ГПТ](https://chatgpt.com/c/6705092b-800c-8006-9d7c-0dd814cd351f)

## Todo List

- [x] ✅️ Fix tests
- [x] ✅ Write to index offset and size of record
- [x] ✅ Restore index after restart app
- [x] ✅ Reconnect to DBServer on client side
- [x] ✅ reject/throw error when clieted make request and client is not connected (now loading always)
- [x] ✅ todo: set work folder for DB (now we must set separate file name)
- [x] ✅ migrate DB core/tests/server to type script
- [x] ✅ determine second language for DB
- [x] ✅ move Index logic to separate class IndexManager
- [ ] 🟩 fix db core nodejs tests
- [ ] 🟩 update entity (фактически тот же db.set)
- [ ] 🟩 delete entity
- [ ] 🟩 get all
- [x] ✅ add SegmentManager
- [ ] 🟩 add CompactionManager 🔥 (add syntetic delay between files or record as settings when compaction)
- [ ] 🟩 add/check eslint/prettier
- [ ] 🟩 add ability to create some independed databases
- [ ] 🟩 add unit tests for FileAdapter
- [ ] 🟩 add unit tests for IndexManager
- [ ] 🟩 add unit tests for SegmentManager
- [ ] 🟩 add unit tests for CompactionManager
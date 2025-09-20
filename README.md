# 說明
感謝抽空幫忙 review 我的實作，以下附上 Q1, Q2 的 Quick Start 說明。
## Q1
若要增加 test case 新增在 testCases 中。
```bash
# 可直接複製執行
python3 ./Q1/invert_tree.py
```

## Q2
我使用 expressJS with Typescript 實作，Q2 的 README 可以[點擊這裡](./Q2/README.md)
```bash
# 可直接複製執行
cd Q2
docker build -t simple-bank . --no-cache
docker run -p 3000:3000 -p 8080:8080 simple-bank
```
API Server url : http://localhost:3000 \
Test coverage report url : http://localhost:8080
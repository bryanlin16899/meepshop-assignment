# 說明
感謝抽空 review 我的實作，以下附上 Q1, Q2 的 Quick Start 說明。
## Q1
若要增加 test case 可以在 testCases 中新增。
```bash
# Quick Start
# 可直接複製執行
cd Q1
python3 ./invert_tree.py

# 回到 meepshop-assignment/
cd ..
```

## Q2
我使用 Express.js with Typescript 實作，Q2 的 README 可以[點擊這裡](./Q2/README.md)
```bash
# Quick Start
# 可直接複製執行
cd Q2
docker build -t simple-bank . --no-cache
docker run -p 3000:3000 -p 8080:8080 simple-bank

# 回到 meepshop-assignment/
cd ..
```
Frontend for test : http://localhost:3000 \
API : http://localhost:3000/api/bank \
Swagger API documentation : http://localhost:3000/swagger \
Test coverage report url : http://localhost:8080
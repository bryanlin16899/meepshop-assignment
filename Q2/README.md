# Simple banking system
## Introduction
這是一個簡易的銀行系統，我選擇使用 Express.js with Typescript。<br>

支援帳戶建立、存款、提款、轉帳、交易紀錄等功能，並且使用 async-mutex 避免對帳戶金額做變動的 API 產生 race condition。<br>

Unit test 與 Integration test 使用 jest 與 supertest。

並且我寫了一個[前端頁面](http://localhost:3000)方便測試，亦可直接使用 API，相關 [swagger 文件](http://localhost:3000/swagger)可以在 docker container 執行後查看。

<img src=https://pub-d3072a93d1ae4cb9b4ff48e336a3bdf0.r2.dev/simplebankdemo.gif width=600 />

## Quick Start
```bash
# inside project root folder
cd Q2

# build docker image with no cache
docker build -t simple-bank . --no-cache

# run docker container
# port 3000 -> API server and serve frontend web page
# port 8080 -> Unit test coverage report
docker run -p 3000:3000 -p 8080:8080 simple-bank
```

## Assignment Requirements
<table>
    <tr>
        <td>敘述</td>
        <td>完成</td>
        <td>備註</td>
    </tr>
    <tr>
        <td>Implement System by restful API </td>
        <td>✅</td>
        <td>為了保持輕量，使用 Express.js</td>
    </tr>
    <tr>
        <td>Account balance cannot be negative</td>
        <td>✅</td>
        <td>N/A</td>
    </tr>
    <tr>
        <td>Create an account with name and balance</td>
        <td>✅</td>
        <td>/api/bank/createAccount</td>
    </tr>
    <tr>
        <td>Able to deposit money to an account</td>
        <td>✅</td>
        <td>/api/bank/deposit</td>
    </tr>
    <tr>
        <td>Able to withdraw money from an account</td>
        <td>✅</td>
        <td>/api/bank/withdraw</td>
    </tr>
    <tr>
        <td>Able to transfer money from one account to another account</td>
        <td>✅</td>
        <td>/api/bank/transfer</td>
    </tr>
    <tr>
        <td>Generate transaction logs for each account transfer(when, how much, to what account)</td>
        <td>✅</td>
        <td>
            1. /api/bank/getAllTransactionLogs<br>2./api/bank/getAccountTransactionLogs
        </td>
    </tr>
    <tr>
        <td>Support atomic transaction</td>
        <td>✅</td>
        <td>使用 async-mutex 確保變更餘額的動作同一時間只會有一個 thread 執行</td>
    </tr>
    <tr>
        <td>Include unit tests & integration test</td>
        <td>✅</td>
        <td>使用 Jest 與 Supertest 做 unit test 和 integration test</td>
    </tr>
    <tr>
        <td>Provide a docker container run server</td>
        <td>✅</td>
        <td>因為只有 express 的 server，這裡單純用 docker container 不使用 docker compose</td>
    </tr>
</table>

## Technical Stacks
- Language: Typescript
- Framework: Express.js
- Database: No Database, I save data in memory using Map
- Unit Testing: Jest
- Integration Testing: Supertest
- Documentation: Swagger

## Testing
### Available Test Commands
```bash
# Run all tests (unit + integration)
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
npm run test:watch:unit
npm run test:watch:integration
```

### Test Structure

- **Unit Tests**: `src/bank/bank.service.test.ts` - Tests business logic in isolation
- **Integration Tests**: `src/bank/bank.router.integration.test.ts` - Tests API endpoints end-to-end

### Test Coverage

為了方便展示，每次 build docker image 時，會執行 unit test，可以在執行 docker run 後，開啟 http://localhost:8080 查看。

![Jest Test Coverage Report](https://pub-d3072a93d1ae4cb9b4ff48e336a3bdf0.r2.dev/testCoverage.png)
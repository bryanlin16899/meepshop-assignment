# Simple banking system

## Quick Start
```bash
// inside project root folder
$ cd Q2

// build docker image with no cache
$ docker build -t simple-bank . --no-cache

// run docker container
// port 3000 -> API server
// port 8080 -> Unit test coverage report
$ docker run -p 3000:3000 -p 8080:8080 simple-bank
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
        <td>為了保持輕量，使用 expressJs</td>
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
        <td>使用 Jest 做 unit test</td>
    </tr>
    <tr>
        <td>Provide a docker container run server</td>
        <td>✅</td>
        <td>因為只有 express 的 server，這裡單純用 docker 不使用 docker compose</td>
    </tr>
</table>

## Technical Stacks
- Language: Typescript
- Framework: expressJS
- Database: No Database, I save data in memory using Map
- Testing: Jest
- Documentation: Swagger

## Test Coverage

為了方便展示，每次 build docker image 時，我會執行 unit test，可以在執行 docker run 後，開啟 http://localhost:8080/ 查看。

![Jest Test Coverage Report](https://pub-d3072a93d1ae4cb9b4ff48e336a3bdf0.r2.dev/testCoverage.png)
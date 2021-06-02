# 環境変数でsequelizeを設定する方法(config.use_env_variable)

[.envで接続を切り替える方法](https://github.com/murasuke/dotenv-sequelize)

## 前書き

* sequelizeはcliを利用することで、設定ファイル(config.json)、Model、Migration、Seederのひな形を作ることができて便利ですが、DB接続設定がファイルに直書きされるため不便な場合があります。

* ひな形の'./models/index.js'には環境変数から読み込むコードがありますが、デッドコードになっています。これを利用して環境変数から接続設定を読み込むように書き換えます。


```javascript
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
}
```

* 環境変数から値を取得するようにconfig.jsonファイルを変更します。

  プロパティー'use_env_variable'で、利用する環境変数名を指定します。

```json
  "development": {
    "use_env_variable": "DB_CONNECTION_URI"
  }
```

### 前提

* コマンドはgitbashを利用する前提で書いてあります。

## 準備

* dockerが入っていない場合はインストール

  https://www.docker.com/


* dockerでmysqlをインストール

  パスワードは必要に応じて変更して下さい。

```bash
docker run --name mysqlcontainer -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=DB_NAME -p 3306:3306 mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

* sequelizeをインストール

```bash
npm init -y

npm install sequelize sequelize-cli mysql2
```

* `.sequelizerc`を作成し、sequelize関連ファイルを(./sequelize)配下にまとめる

  プロジェクトのルートフォルダに `.sequelizerc`ファイルを作成し、設定ファイル、model、migration、seeederの各フォルダを指定します。


```bash
touch .sequelizerc
```

``` javascript
const path = require('path');

module.exports = {
    'config': path.resolve('./sequelize/config', 'config.json'),
    'models-path': path.resolve('./sequelize/models'),
    'seeders-path': path.resolve('./sequelize/seeders'),
    'migrations-path': path.resolve('./sequelize/migrations'),
};
```

### sequelize初期化

```bash
npx sequelize init
```

下記ファイルが生成されます。
```
./sequelize
    ├─config
    │   └ config.json
    ├─migrations
    ├─models
    │   └ index.js
    └seeders
```

### config.jsonの書き換え

* 書き換え前(生成直後)
  
  設定がファイル直接記載されています。ソース管理をしている場合、環境ごと書き換えが発生するので不便です。

```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

```


* 書き換え後

`DB_CONNECTION_URI`はMySQLを設定する環境変数の名前です。プログラム実行前に設定する必要があります。

```json
{
  "development": {
    "use_env_variable": "DB_CONNECTION_URI"
  },
  "test": {
    "use_env_variable": "DB_CONNECTION_URI"
  },
  "production": {
    "use_env_variable": "DB_CONNECTION_URI"
  }
}
```

### migration確認のためのファイル作成(user)

* 動作確認のためテーブル作成(migrationファイル作成)を行います
  
  modelとseederのひな形を作成します。
```
npx sequelize model:generate --name User --attributes name:string,birth:date,email:string
npx sequelize seed:generate --name user
```

 * seederを書き換えデータ登録できるようにします

 ```javascript
 'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    return await queryInterface.bulkInsert("Users",[
      { name: "name1", email: "email1", birth: now, createdAt: now, updatedAt: now},
      { name: "name2", email: "email2", birth: now, createdAt: now, updatedAt: now},
      { name: "name3", email: "email3", birth: now, createdAt: now, updatedAt: now},
      { name: "name4", email: "email4", birth: now, createdAt: now, updatedAt: now},
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Users", null, {} );
  }
};

 ```

## 実行と確認

### 接続文字列を環境変数`DB_CONNECTION_URI`に設定します

```bash
export DB_CONNECTION_URI='mysql://root:password@localhost:3306/test_db'
```

### MySQLが起動していない場合は起動します
```bash
docker restart mysqlcontainer
```
### migrationの実行

* database作成

```bash
$ npx sequelize db:create

Sequelize CLI [Node: 14.15.1, CLI: 6.2.0, ORM: 6.6.2]

Loaded configuration file "sequelize\config\config.json".
Using environment "development".
Database test_db created.
```
* migration実行

```bash
$ npx sequelize db:migrate

Sequelize CLI [Node: 14.15.1, CLI: 6.2.0, ORM: 6.6.2]

Loaded configuration file "sequelize\config\config.json".
Using environment "development".
== 20210522023826-create-user: migrating =======
== 20210522023826-create-user: migrated (0.094s)
```

* seeder実行

```bash
$ npx sequelize db:seed:all

Sequelize CLI [Node: 14.15.1, CLI: 6.2.0, ORM: 6.6.2]

Loaded configuration file "sequelize\config\config.json".
Using environment "development".
== 20210522072600-user: migrating =======
== 20210522072600-user: migrated (0.042s)
```

### 動作確認

index.jsを作成し、Userテーブルを正しくselect出来ることを確認します。

```javascript
const db = require('./sequelize/models/index'); // cliでinitした時に作成されるmodels配下のindex.js

// findAll
(async () => {
   const users = await db.User.findAll();
  for(user of users) {
    console.log(users);
  }
})();

```

* 実行結果
```js
$ node index.js
Executing (default): SELECT `id`, `name`, `birth`, `email`, `createdAt`, `updatedAt` FROM `Users` AS `User`;
[
  User {
    dataValues: {
      id: 1,
      name: 'name1',
      birth: 2021-05-08T14:27:06.852Z,
      email: 'email1',
      createdAt: 2021-05-08T14:27:06.852Z,
      updatedAt: 2021-05-08T14:27:06.852Z
    },
    _previousDataValues: {
      id: 1,
      name: 'name1',
      birth: 2021-05-08T14:27:06.852Z,
      email: 'email1',
      createdAt: 2021-05-08T14:27:06.852Z,
      updatedAt: 2021-05-08T14:27:06.852Z
    },
    _changed: Set(0) {},
    _options: {
      isNewRecord: false,
      _schema: null,
      _schemaDelimiter: '',
      raw: true,
      attributes: [Array]
    },
    isNewRecord: false
  },
  // ～～ 以下省略 ～～
```

## おまけ
  package.jsonの"scripts"にコマンドを登録しておきます

* よく使う(ことになる)dockerコマンドとsequelizeコマンドを登録しておきます

```json
  "scripts": {
    "mysql:install": "docker run --name mysqlcontainer -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=DB_NAME -p 3306:3306 mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_bin",
    "mysql:remove": "docker rm mysqlcontainer",
    "mysql:start": "docker restart mysqlcontainer",
    "mysql:stop": "docker stop mysqlcontainer",
    "db:create": "npx sequelize db:create",
    "db:migrate": "npx sequelize db:migrate",
    "db:seed:all": "npx sequelize db:seed:all",
    "db:drop": "npx sequelize db:drop"
  },
```

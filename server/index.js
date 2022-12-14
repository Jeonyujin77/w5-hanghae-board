const jsonServer = require("json-server");
const path = require("path");
const url = require("url");
const {
  filteredPasswordObjs,
  filteredPasswordObj,
  getDomain,
  validPassword,
  sortedBy,
} = require("./utils");

const server = jsonServer.create();
const router = jsonServer.router(path.resolve(__dirname + "/db.json"));
const middlewares = jsonServer.defaults({
  static: path.resolve(__dirname + "/../build/"),
});

const port = process.env.PORT || 3001;

server.use(middlewares);

server.get("/posts", (req, res) => {
  const { _sort, _order } = url.parse(req.url, true).query;
  return res.jsonp(
    sortedBy(filteredPasswordObjs(router.db.__wrapped__.posts), _sort, _order)
  );
});

server.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  const response = router.db.__wrapped__.posts.find(
    (post) => post.id.toString() === id
  );
  return response
    ? res.jsonp(filteredPasswordObj(response))
    : res.status(404).send({ message: "해당 데이터를 찾을 수 없습니다" });
});

server.get("/comments", (req, res) => {
  const { _sort, _order } = url.parse(req.url, true).query;
  const { postId } = url.parse(req.url, true).query;
  return res.jsonp(
    sortedBy(
      filteredPasswordObjs(
        router.db.__wrapped__.comments.filter(
          (comment) => comment.postId === postId
        )
      ),
      _sort,
      _order
    )
  );
});

server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if (req.method.toString() === "PATCH" || req.method.toString() === "DELETE") {
    if (!req?.body) {
      return res.status(400).send({ message: "입력이 올바르지 않습니다." });
    }
    const { id, password } = req.body;
    if (
      !password ||
      !validPassword(
        router.db.__wrapped__[getDomain(req.originalUrl)],
        id,
        password
      )
    ) {
      return res.status(400).send({ message: "비밀번호를 확인하세요" });
    }
  }
  next();
});

server.use(router);

server.listen(port, () => {
  console.log("JSON Server is running");
});

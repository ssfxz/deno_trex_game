# Chrome T-Rex Game

[![ci](https://github.com/justjavac/deno_trex_game/actions/workflows/ci.yml/badge.svg)](https://github.com/justjavac/deno_trex_game/actions/workflows/ci.yml)

Chrome offline T-rex game.

在线试玩地址：https://trex.deno.dev

## 本地开发

1. 安装 `deployctl`:

```bash
deno install -Afr --no-check https://deno.land/x/deploy/deployctl.ts
```

1. 启动本地开发服务器：

```bash
deployctl run --watch ./mod.ts
```

## 开发计划

- [ ] 排行榜
- [ ] 在线对战/协作
- [ ] 直播/回放

## License

[deno_trex_game](https://github.com/justjavac/deno_trex_game) is released under
the MIT License. See the bundled [LICENSE](./LICENSE) file for details.

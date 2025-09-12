# renamer

- 一个前后端练手项目，参考了[Episode-ReName](https://github.com/Nriver/Episode-ReName)项目，后端采用go + echo框架，前端采用React + TypeScript + Ant Design + Tailwind Css
- docker
```
version: '3'
services:
  renamer:
    image: "lemonc7/renamer:latest"
    container_name: renamer
    network_mode: bridge
    volumes:
      - "/path/downloads:/home/downloads"  # 更改路径
      - "/path/video:/home/video"  # 更改路径
      - /etc/localtime:/etc/localtime:ro
    ports:
      - 7777:7777
    restart: unless-stopped
```

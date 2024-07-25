# 使用 Node.js 官方的 Alpine 基础镜像，它更小巧
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 安装生产环境依赖
RUN npm ci --only=production

# 复制源代码
COPY index.js ./

# 使用非 root 用户运行应用
USER node

# 使用多阶段构建，创建最终镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制必要的文件
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/index.js ./

# 设置环境变量
ENV NODE_ENV=production

# 使用非 root 用户运行应用
USER node

# 暴露端口
# EXPOSE 8080

# 启动应用
CMD ["node", "index.js"]

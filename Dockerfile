FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖并构建
RUN npm ci
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
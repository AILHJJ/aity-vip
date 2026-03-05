# 监控指南

> **文档类型**: 运维文档
> **创建日期**: 2026-03-05
> **最后更新**: 2026-03-05
> **维护人员**: 运维团队
> **适用版本**: v2.0.0

---

## 文档概述

本文档提供VIP投研内部分享系统的完整监控方案，包括监控指标、告警规则、日志管理和监控工具配置。

---

## 目录

- [监控架构](#监控架构)
- [监控指标](#监控指标)
- [告警规则](#告警规则)
- [日志管理](#日志管理)
- [监控工具](#监控工具)

---

## 监控架构

### 监控层次

```
┌─────────────────────────────────────────┐
│           监控展示层 (Grafana)            │
├─────────────────────────────────────────┤
│         监控数据层 (Prometheus)          │
├─────────────────────────────────────────┤
│   监控采集层 (Node Exporter + App)       │
├─────────────────────────────────────────┤
│  基础设施层 (服务器 + 数据库 + 应用)     │
└─────────────────────────────────────────┘
```

### 监控组件

| 组件 | 用途 | 状态 |
|------|------|------|
| **Prometheus** | 监控数据采集和存储 | 待部署 |
| **Grafana** | 监控数据可视化 | 待部署 |
| **Node Exporter** | 系统指标采集 | 待部署 |
| **MySQL Exporter** | 数据库指标采集 | 待部署 |
| **应用埋点** | 应用性能监控 | 部分实现 |

---

## 监控指标

### 系统指标

#### CPU监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **CPU使用率** | 整体CPU使用百分比 | >80% |
| **单核CPU使用率** | 单个CPU核心使用百分比 | >90% |
| **CPU负载** | 系统平均负载 | >CPU核心数 |
| **进程数** | 运行进程总数 | >1000 |

**Prometheus查询**：
```promql
# CPU使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# CPU负载
node_load1 / count by (instance) (node_cpu_seconds_total{mode="idle"}) * 100
```

#### 内存监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **内存使用率** | 已用内存百分比 | >80% |
| **可用内存** | 剩余可用内存量 | <1GB |
| **Swap使用率** | Swap使用百分比 | >50% |
| **缓存内存** | 缓存占用内存量 | 监控趋势 |

**Prometheus查询**：
```promql
# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Swap使用率
(1 - (node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes)) * 100
```

#### 磁盘监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **磁盘使用率** | 已用磁盘百分比 | >80% |
| **磁盘IO利用率** | IO操作占用百分比 | >70% |
| **磁盘读取速率** | 每秒读取字节数 | >100MB/s |
| **磁盘写入速率** | 每秒写入字节数 | >100MB/s |
| **Inode使用率** | Inode使用百分比 | >80% |

**Prometheus查询**：
```promql
# 磁盘使用率
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# IO等待时间占比
irate(node_cpu_seconds_total{mode="iowait"}[5m]) * 100
```

#### 网络监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **网络入站流量** | 每秒接收字节数 | >100MB/s |
| **网络出站流量** | 每秒发送字节数 | >100MB/s |
| **网络连接数** | 当前网络连接总数 | >10000 |
| **TCP连接数** | TCP连接总数 | >8000 |
| **网络错误率** | 网络错误占比 | >1% |

**Prometheus查询**：
```promql
# 网络流量
irate(node_network_receive_bytes_total[5m])
irate(node_network_transmit_bytes_total[5m])

# TCP连接数
node_netstat_Tcp_CurrEstab
```

### 应用指标

#### 后端服务监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **服务状态** | 后端服务运行状态 | !=1 |
| **响应时间** | API平均响应时间 | >1s |
| **请求成功率** | 成功请求占比 | <99% |
| **QPS** | 每秒请求数 | >1000 |
| **错误率** | 错误请求占比 | >1% |
| **活跃连接数** | 当前活跃连接数 | >500 |

**Prometheus查询**：
```promql
# 服务状态
up{job="backend"}

# 响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# 请求成功率
(1 - rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100
```

#### 数据库监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **数据库状态** | MySQL运行状态 | !=1 |
| **连接数** | 当前连接数 | >100 |
| **慢查询数** | 慢查询数量 | >10/min |
| **查询响应时间** | 平均查询时间 | >1s |
| **复制延迟** | 主从复制延迟 | >10s |
| **死锁数** | 发生死锁次数 | >0 |

**Prometheus查询**：
```promql
# 连接数
mysql_global_status_threads_connected / mysql_global_variables_max_connections * 100

# 慢查询
rate(mysql_global_status_slow_queries[5m])

# 查询响应时间
rate(mysql_global_status_questions[5m])
```

#### Nginx监控

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **服务状态** | Nginx运行状态 | !=1 |
| **活跃连接数** | 当前活跃连接数 | >1000 |
| **请求速率** | 每秒请求数 | >500 |
| **响应时间** | 平均响应时间 | >2s |
| **4xx错误率** | 客户端错误占比 | >5% |
| **5xx错误率** | 服务器错误占比 | >1% |

**Prometheus查询**：
```promql
# 活跃连接数
nginx_up{status="active"}

# 请求速率
rate(nginx_http_requests_total[5m])

# 错误率
rate(nginx_http_requests_total{status=~"5.."}[5m]) / rate(nginx_http_requests_total[5m]) * 100
```

---

## 告警规则

### 告警级别

| 级别 | 说明 | 响应时间 |
|------|------|----------|
| **P0 - 严重** | 系统不可用 | 15分钟 |
| **P1 - 高危** | 功能严重受损 | 30分钟 |
| **P2 - 中等** | 功能部分影响 | 2小时 |
| **P3 - 低级** | 潜在风险 | 1天 |

### 告警规则配置

**文件**: `/etc/prometheus/alerts.yml`

```yaml
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # CPU告警
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU使用率过高"
          description: "实例 {{ $labels.instance }} CPU使用率超过80%，当前值：{{ $value }}%"

      - alert: CriticalCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "CPU使用率严重过高"
          description: "实例 {{ $labels.instance }} CPU使用率超过90%，当前值：{{ $value }}%"

      # 内存告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "实例 {{ $labels.instance }} 内存使用率超过80%，当前值：{{ $value }}%"

      - alert: CriticalMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "内存使用率严重过高"
          description: "实例 {{ $labels.instance }} 内存使用率超过90%，当前值：{{ $value }}%"

      # 磁盘告警
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "磁盘使用率过高"
          description: "实例 {{ $labels.instance }} 磁盘 {{ $labels.mountpoint }} 使用率超过80%，当前值：{{ $value }}%"

      - alert: CriticalDiskUsage
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 90
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "磁盘使用率严重过高"
          description: "实例 {{ $labels.instance }} 磁盘 {{ $labels.mountpoint }} 使用率超过90%，当前值：{{ $value }}%"

      # 服务告警
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "服务不可用"
          description: "服务 {{ $labels.job }} 在实例 {{ $labels.instance }} 上不可用"

      # API响应时间告警
      - alert: HighAPIResponseTime
        expr: rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API响应时间过长"
          description: "API响应时间超过1秒，当前值：{{ $value }}秒"

      # API错误率告警
      - alert: HighAPIErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API错误率过高"
          description: "API 5xx错误率超过1%，当前值：{{ $value }}%"
```

### 告警通知

#### 通知方式

| 通知方式 | 用途 | 配置状态 |
|---------|------|----------|
| **邮件通知** | 发送告警邮件 | 待配置 |
| **短信通知** | 发送紧急告警短信 | 待配置 |
| **微信通知** | 发送告警到微信群 | 待配置 |
| **钉钉通知** | 发送告警到钉钉群 | 待配置 |

#### 邮件通知配置

**文件**: `/etc/alertmanager/alertmanager.yml`

```yaml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  receiver: 'default-receiver'
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  group_by: ['alertname', 'cluster', 'service']

receivers:
  - name: 'default-receiver'
    email_configs:
      - to: 'ops@example.com'
        headers:
          Subject: '[Prometheus告警] {{ .GroupLabels.alertname }}'
        html: |
          <h2>{{ .GroupLabels.alertname }}</h2>
          <p>告警级别: {{ .CommonLabels.severity }}</p>
          <p>告警时间: {{ .StartsAt }}</p>
          <table>
            <tr><th>告警项</th><th>描述</th></tr>
            {{ range .Alerts }}
            <tr>
              <td>{{ .Labels.alertname }}</td>
              <td>{{ .Annotations.description }}</td>
            </tr>
            {{ end }}
          </table>
```

---

## 日志管理

### 日志分类

| 日志类型 | 存储位置 | 保留时间 | 用途 |
|---------|----------|----------|------|
| **应用日志** | `backend/logs/` | 30天 | 应用调试和问题排查 |
| **访问日志** | `/var/log/nginx/access.log` | 7天 | 访问分析和统计 |
| **错误日志** | `/var/log/nginx/error.log` | 30天 | 错误诊断 |
| **系统日志** | `/var/log/syslog` | 7天 | 系统状态监控 |
| **数据库日志** | `/var/log/mysql/error.log` | 30天 | 数据库问题诊断 |

### 日志配置

#### Nginx日志配置

```nginx
# 访问日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                'rt=$request_time uct="$upstream_connect_time" '
                'uht="$upstream_header_time" urt="$upstream_response_time"';

# 错误日志级别
error_log /var/log/nginx/error.log warn;

# 访问日志
access_log /var/log/nginx/access.log main;
```

#### PM2日志配置

**文件**: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 日志轮转

**文件**: `/etc/logrotate.d/nginx`

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

**文件**: `/etc/logrotate.d/backend`

```
/path/to/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    copytruncate
}
```

### 日志分析

**常用分析命令**：

```bash
# 统计访问量前10的IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计访问量前10的URL
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计HTTP状态码分布
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 查找5xx错误
awk '$9 >= 500' /var/log/nginx/access.log

# 统计响应时间
awk '{print $NF}' /var/log/nginx/access.log | sort -n | tail -10

# 实时监控访问日志
tail -f /var/log/nginx/access.log | grep --line-buffered "5xx"
```

---

## 监控工具

### Prometheus安装

```bash
# 下载Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz

# 解压
tar -xzf prometheus-2.40.0.linux-amd64.tar.gz
cd prometheus-2.40.0.linux-amd64

# 创建配置文件
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']

  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
EOF

# 启动Prometheus
./prometheus --config.file=prometheus.yml

# 设置为系统服务
sudo useradd --no-create-home --shell /bin/false prometheus
sudo mkdir /etc/prometheus
sudo cp prometheus prometheus.yml /etc/prometheus/
sudo chown -R prometheus:prometheus /etc/prometheus

# 创建systemd服务
cat > /etc/systemd/system/prometheus.service << 'EOF'
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/etc/prometheus/prometheus \
  --config.file /etc/prometheus/prometheus.yml \
  --storage.tsdb.path /var/lib/prometheus/

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable prometheus
sudo systemctl start prometheus
```

### Grafana安装

```bash
# 添加Grafana源
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# 添加GPG密钥
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# 安装Grafana
sudo apt-get update
sudo apt-get install -y grafana

# 启动Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# 访问Grafana
# URL: http://localhost:3000
# 默认用户名: admin
# 默认密码: admin
```

### Node Exporter安装

```bash
# 下载Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz

# 解压
tar -xzf node_exporter-1.3.1.linux-amd64.tar.gz
cd node_exporter-1.3.1.linux-amd64

# 启动Node Exporter
./node_exporter

# 设置为系统服务
sudo useradd --no-create-home --shell /bin/false node_exporter
sudo cp node_exporter /usr/local/bin/

# 创建systemd服务
cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

---

## 相关文档

- [系统维护](./maintenance.md) - 维护流程和备份策略
- [故障排查](./troubleshooting.md) - 常见问题和解决方案
- [部署手册](../02-deployment/deployment-guide.md) - 部署流程和配置

---

**维护团队**: 运维团队
**最后更新**: 2026-03-05
**版本**: v1.0.0

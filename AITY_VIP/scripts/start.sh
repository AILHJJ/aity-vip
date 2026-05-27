#!/bin/bash
# 启动脚本 - 用于启动开发环境的前后端服务

# 颜色输出函数
function echo_green() {
    echo -e "\033[32m$1\033[0m"
}

function echo_yellow() {
    echo -e "\033[33m$1\033[0m"
}

function echo_red() {
    echo -e "\033[31m$1\033[0m"
}

# Check if port is occupied
function test_port() {
    local port=$1
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is occupied
    else
        return 1  # Port is free
    fi
}

# Kill process by port
function kill_process_by_port() {
    local port=$1
    local pids=$(lsof -Pi :"$port" -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$pids" ]; then
        for pid in $pids; do
            echo_yellow "  Killing process $pid occupying port $port..."
            kill -9 "$pid" 2>/dev/null
        done
        return 0
    else
        return 1
    fi
}

# Wait for port to be free
function wait_port_free() {
    local port=$1
    local timeout=${2:-10}
    local start_time=$(date +%s)
    local current_time
    
    while true; do
        current_time=$(date +%s)
        if [ $((current_time - start_time)) -ge $timeout ]; then
            return 1  # Timeout
        fi
        
        if ! test_port "$port"; then
            return 0  # Port is free
        fi
        
        sleep 0.5
    done
}

# 开始启动
echo_yellow "开始启动AITY VIP开发环境..."
echo_yellow "Project path: $(dirname "$0")/.."

# Define service ports
BACKEND_PORT=3001
FRONTEND_PORT=5173

# Check and kill processes occupying ports
echo_yellow "\n[0/2] Checking port occupancy..."

# Check backend port
if test_port "$BACKEND_PORT"; then
    echo_yellow "  Backend port $BACKEND_PORT is occupied, trying to kill process..."
    kill_process_by_port "$BACKEND_PORT"
    if wait_port_free "$BACKEND_PORT"; then
        echo_green "  Backend port $BACKEND_PORT is now free!"
    else
        echo_red "  Backend port $BACKEND_PORT could not be freed, please kill process manually!"
    fi
else
    echo_green "  Backend port $BACKEND_PORT is available"
fi

# Check frontend port
if test_port "$FRONTEND_PORT"; then
    echo_yellow "  Frontend port $FRONTEND_PORT is occupied, trying to kill process..."
    kill_process_by_port "$FRONTEND_PORT"
    if wait_port_free "$FRONTEND_PORT"; then
        echo_green "  Frontend port $FRONTEND_PORT is now free!"
    else
        echo_red "  Frontend port $FRONTEND_PORT could not be freed, please kill process manually!"
    fi
else
    echo_green "  Frontend port $FRONTEND_PORT is available"
fi

# 1. 启动后端服务
echo_yellow "\n[1/2] Starting backend service..."
cd "$(dirname "$0")/../backend"
if npm install; then
    echo_green "  Backend dependencies installed successfully!"
else
    echo_red "Backend dependency installation failed!"
    exit 1
fi

# 在新终端启动后端服务
echo_yellow "  Starting backend service..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="AITY VIP Backend" -- bash -c "npm run dev; exec bash"
    echo_green "  Backend service started in new window!"
elif command -v xterm &> /dev/null; then
    xterm -title "AITY VIP Backend" -e "npm run dev"
    echo_green "  Backend service started in new window!"
elif [ "$(uname)" = "Darwin" ]; then
    # macOS
    open -a Terminal.app -n --args -c "cd '$(pwd)'; npm run dev"
    echo_green "  Backend service started in new window!"
elif command -v cmd.exe &> /dev/null; then
    cmd.exe /c "start cmd /k cd \"$(pwd)\" && npm run dev"
    echo_green "  Backend service started in new window!"
else
    echo_yellow "  No terminal emulator found, starting backend service in background..."
    npm run dev &
    echo_green "  Backend service started in background!"
fi

# Wait for backend to start
echo_yellow "  Waiting for backend service to start..."
sleep 3

# 2. 启动前端服务
echo_yellow "\n[2/2] Starting frontend service..."
cd "$(dirname "$0")/../aity-uni-app-v2"
if npm install; then
    echo_green "  Frontend dependencies installed successfully!"
else
    echo_red "Frontend dependency installation failed!"
    exit 1
fi

# 在新终端启动前端服务
echo_yellow "  Starting frontend service..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="AITY VIP Frontend" -- bash -c "npm run dev; exec bash"
    echo_green "  Frontend service started in new window!"
elif command -v xterm &> /dev/null; then
    xterm -title "AITY VIP Frontend" -e "npm run dev"
    echo_green "  Frontend service started in new window!"
elif [ "$(uname)" = "Darwin" ]; then
    # macOS
    open -a Terminal.app -n --args -c "cd '$(pwd)'; npm run dev"
    echo_green "  Frontend service started in new window!"
elif command -v cmd.exe &> /dev/null; then
    cmd.exe /c "start cmd /k cd \"$(pwd)\" && npm run dev"
    echo_green "  Frontend service started in new window!"
else
    echo_yellow "  No terminal emulator found, starting frontend service in background..."
    npm run dev &
    echo_green "  Frontend service started in background!"
fi

echo_green "\n🎉 AITY VIP development environment started successfully!"
echo_green "Frontend development server address: http://localhost:5173"
echo_green "Backend development server address: http://localhost:3001"
echo_yellow "\nNote: Closing this window will not stop the services, please close the frontend and backend service windows to stop the services"
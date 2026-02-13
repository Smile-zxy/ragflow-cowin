import os
import sys
import subprocess

# 1. 自动检测并安装依赖 (使用清华源加速)
try:
    import huggingface_hub
except ImportError:
    print("正在安装 huggingface_hub 依赖...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub", "-i", "https://pypi.tuna.tsinghua.edu.cn/simple"])
        import huggingface_hub
    except Exception as e:
        print(f"自动安装失败，请手动运行: pip install huggingface_hub")
        sys.exit(1)

from huggingface_hub import snapshot_download

def download_xgb_model():
    # 获取项目根目录
    project_root = os.path.dirname(os.path.abspath(__file__))
    # 目标目录: rag/res/deepdoc
    target_dir = os.path.join(project_root, "rag", "res", "deepdoc")
    
    print(f"Target directory: {target_dir}")
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
        print(f"Created directory: {target_dir}")

    try:
        print("Starting download for InfiniFlow/text_concat_xgb_v1.0 ...")
        
        # 2. 设置 HF 镜像环境变量 (使用 hf-mirror.com)
        os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
        
        # 下载模型文件
        snapshot_download(
            repo_id="InfiniFlow/text_concat_xgb_v1.0",
            local_dir=target_dir,
            local_dir_use_symlinks=False,
            resume_download=True
        )
        print("\n✅ Download completed successfully!")
        print(f"Model file location: {os.path.join(target_dir, 'updown_concat_xgb.model')}")
        print("Please restart your RAGFlow backend service now.")
        
    except Exception as e:
        print(f"\n❌ Error downloading model: {e}")
        print("Please check your network connection.")

if __name__ == "__main__":
    download_xgb_model()
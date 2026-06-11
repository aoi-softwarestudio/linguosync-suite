import requests
import urllib.parse
import sys

def run_tests():
    print("=== VENDIX 決済フロー検証開始 ===")
    
    # 1. チェックアウトセッションの作成テスト
    print("\n[テスト 1] /api/create-checkout-session のテスト")
    url_create = "http://localhost:8000/api/create-checkout-session"
    payload = {
        "spot_id": "test_spot_123",
        "spot_name": "渋谷ハチ公前自販機",
        "user_id": "test_user_sota"
    }
    
    try:
        # refererヘッダーを設定してベースURLが正しく認識されるかテスト
        headers = {
            "Referer": "http://localhost:8003/index.html"
        }
        res = requests.post(url_create, json=payload, headers=headers)
        if res.status_code != 200:
            print(f"FAIL: ステータスコードが {res.status_code} です")
            sys.exit(1)
            
        data = res.json()
        print(f"レスポンスデータ: {data}")
        
        if data.get("status") != "success":
            print("FAIL: ステータスが success ではありません")
            sys.exit(1)
            
        checkout_url = data.get("checkout_url")
        if not checkout_url:
            print("FAIL: checkout_url がありません")
            sys.exit(1)
            
        print(f"SUCCESS: チェックアウトURLが生成されました -> {checkout_url}")
        
        # 2. 生成されたURLのパラメータチェック
        print("\n[テスト 2] 生成されたURLのパラメータ検証")
        parsed_url = urllib.parse.urlparse(checkout_url)
        params = urllib.parse.parse_qs(parsed_url.query)
        
        print(f"解析されたパラメータ: {params}")
        
        stripe_success = params.get("stripe_success", [None])[0]
        spot_id = params.get("spot_id", [None])[0]
        session_id = params.get("session_id", [None])[0]
        
        if stripe_success != "true":
            print(f"FAIL: stripe_success={stripe_success} (期待値: true)")
            sys.exit(1)
        if spot_id != "test_spot_123":
            print(f"FAIL: spot_id={spot_id} (期待値: test_spot_123)")
            sys.exit(1)
        if not session_id:
            print("FAIL: session_id がありません")
            sys.exit(1)
            
        print(f"SUCCESS: パラメータ検証完了 (session_id={session_id})")
        
        # 3. セッション検証テスト
        print("\n[テスト 3] /api/verify-checkout-session のテスト")
        url_verify = f"http://localhost:8000/api/verify-checkout-session?session_id={session_id}"
        res_verify = requests.get(url_verify)
        if res_verify.status_code != 200:
            print(f"FAIL: 検証ステータスコードが {res_verify.status_code} です")
            sys.exit(1)
            
        verify_data = res_verify.json()
        print(f"検証レスポンスデータ: {verify_data}")
        
        if verify_data.get("status") != "success" or not verify_data.get("paid"):
            print("FAIL: セッション検証に失敗しました、または未払いと判定されました")
            sys.exit(1)
            
        print("SUCCESS: セッション検証完了 (paid=True)")
        
    except Exception as e:
        print(f"FAIL: テスト中に例外が発生しました: {e}")
        sys.exit(1)

    print("\n=== VENDIX 決済フロー検証完了: すべて成功！ ===")

if __name__ == "__main__":
    run_tests()

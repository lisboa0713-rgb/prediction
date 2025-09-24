document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');

    // フォームが送信されたときの処理
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // ページの再読み込みを防ぐ

        // フォームからデータを取得
        const date = document.getElementById('date').value;
        const teams = document.getElementById('teams').value;
        const league = document.getElementById('league').value;
        const market = document.getElementById('market').value;
        const odds = parseFloat(document.getElementById('odds').value);
        const result = document.getElementById('result').value;

        // 新しい予想データを作成
        const newPrediction = {
            date,
            teams,
            league,
            market,
            odds,
            result
        };

        // 既存のデータを取得（ローカルストレージから）
        let predictions = JSON.parse(localStorage.getItem('predictions')) || [];

        // 新しいデータを追加
        predictions.push(newPrediction);

        // データをローカルストレージに保存
        localStorage.setItem('predictions', JSON.stringify(predictions));

        // フォームをリセット
        form.reset();

        // データの表示を更新
        displayPredictions();
    });

    // 既存の予想データを表示する関数
    function displayPredictions() {
        const displayArea = document.getElementById('results-display');
        displayArea.innerHTML = ''; // 表示エリアをクリア

        const predictions = JSON.parse(localStorage.getItem('predictions')) || [];

        if (predictions.length === 0) {
            displayArea.innerHTML = '<p>まだ予想がありません。</p>';
            return;
        }

        // ここに集計と表示のロジックを実装します
        // 次回以降のステップで詳細を解説します
        
        // とりあえず全データをリストで表示
        const ul = document.createElement('ul');
        predictions.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.date} - ${p.teams} (${p.league}): ${p.result === 'win' ? '的中' : '不的中'} @${p.odds}`;
            ul.appendChild(li);
        });
        displayArea.appendChild(ul);
    }

    // ページロード時にデータを表示
    displayPredictions();
});

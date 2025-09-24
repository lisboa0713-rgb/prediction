document.addEventListener('DOMContentLoaded', () => {
    // HTML要素を取得
    const form = document.getElementById('prediction-form');
    const displayArea = document.getElementById('results-display');

    // フォーム送信イベントのリスナーを追加
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // フォームのデフォルト送信（ページ再読み込み）を防止

        // 入力値を取得
        const date = document.getElementById('date').value;
        const teams = document.getElementById('teams').value;
        const league = document.getElementById('league').value.trim();
        const market = document.getElementById('market').value;
        const odds = parseFloat(document.getElementById('odds').value);
        const result = document.getElementById('result').value;

        // 新しい予想データをオブジェクトとして作成
        const newPrediction = {
            date,
            teams,
            league,
            market,
            odds,
            result
        };

        // ローカルストレージから既存のデータを取得。データがない場合は空の配列を初期化
        let predictions = JSON.parse(localStorage.getItem('predictions')) || [];

        // 新しいデータを配列に追加
        predictions.push(newPrediction);

        // 更新されたデータをローカルストレージに保存
        localStorage.setItem('predictions', JSON.stringify(predictions));

        // フォームをリセットして次の入力に備える
        form.reset();

        // 画面の表示を更新
        displayPredictions();
    });

    // 予想データを表示する関数
    function displayPredictions() {
        // 表示エリアをクリア
        displayArea.innerHTML = '';

        // ローカルストレージからデータを取得
        const predictions = JSON.parse(localStorage.getItem('predictions')) || [];

        // データがない場合のメッセージ
        if (predictions.length === 0) {
            displayArea.innerHTML = '<p>まだ予想がありません。フォームから新しい予想を記録してください。</p>';
            return;
        }

        // リーグごとのデータを集計するためのオブジェクト
        const leagueSummary = {};

        predictions.forEach(p => {
            const leagueName = p.league;

            // リーグが存在しない場合は初期化
            if (!leagueSummary[leagueName]) {
                leagueSummary[leagueName] = {
                    totalPredictions: 0,
                    wins: 0,
                    totalPayout: 0,
                    totalBet: 0
                };
            }

            // 集計
            leagueSummary[leagueName].totalPredictions++;
            leagueSummary[leagueName].totalBet++;
            if (p.result === 'win') {
                leagueSummary[leagueName].wins++;
                leagueSummary[leagueName].totalPayout += p.odds;
            }
        });

        // グラフ描画のためのデータ整形
        const leagueLabels = Object.keys(leagueSummary);
        const winRatesData = leagueLabels.map(league => {
            return ((leagueSummary[league].wins / leagueSummary[league].totalPredictions) * 100).toFixed(2);
        });
        const profitRatesData = leagueLabels.map(league => {
            const profit = leagueSummary[league].totalPayout - leagueSummary[league].totalBet;
            return ((profit / leagueSummary[league].totalBet) * 100).toFixed(2);
        });

        // グラフを描画
        const ctx = document.getElementById('myChart');
        if (ctx) { // canvas要素が存在するか確認
             if (window.myChartInstance) {
                 window.myChartInstance.destroy();
             }
             window.myChartInstance = new Chart(ctx, {
                 type: 'bar',
                 data: {
                     labels: leagueLabels,
                     datasets: [{
                         label: '的中率 (%)',
                         data: winRatesData,
                         backgroundColor: 'rgba(75, 192, 192, 0.6)',
                         borderColor: 'rgba(75, 192, 192, 1)',
                         borderWidth: 1
                     }, {
                         label: '収益率 (%)',
                         data: profitRatesData,
                         backgroundColor: 'rgba(153, 102, 255, 0.6)',
                         borderColor: 'rgba(153, 102, 255, 1)',
                         borderWidth: 1
                     }]
                 },
                 options: {
                     scales: {
                         y: {
                             beginAtZero: true,
                             title: {
                                 display: true,
                                 text: 'パーセント (%)'
                             }
                         }
                     }
                 }
             });
        }
        
        // リーグごとの結果を表示するためのHTMLを作成
        const summaryHtml = Object.keys(leagueSummary).map(league => {
            const summary = leagueSummary[league];
            const winRate = (summary.wins / summary.totalPredictions) * 100;
            const profit = summary.totalPayout - summary.totalBet;
            const profitRate = (profit / summary.totalBet) * 100;

            return `
                <div class="league-summary">
                    <h3>${league}</h3>
                    <p><strong>総予想数:</strong> ${summary.totalPredictions}</p>
                    <p><strong>的中数:</strong> ${summary.wins}</p>
                    <p><strong>的中率:</strong> ${winRate.toFixed(2)}%</p>
                    <p><strong>収支:</strong> ${profit.toFixed(2)}</p>
                    <p><strong>収益率:</strong> ${profitRate.toFixed(2)}%</p>
                </div>
            `;
        }).join('');

        displayArea.innerHTML = `
            <h2>リーグ別集計</h2>
            ${summaryHtml}
            <hr>
            <h2>全予想履歴</h2>
            <ul id="history-list">
                ${predictions.reverse().map(p => `
                    <li>
                        ${p.date} - ${p.teams} (${p.league}):
                        <strong>${p.result === 'win' ? '的中' : '不的中'}</strong> @${p.odds}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // ページロード時にデータを表示
    displayPredictions();
});


import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Trophy, Zap, Layers, History, TrendingUp } from "lucide-react";
import { 
  analyzeHistoryData, 
  calculateScores, 
  performNineLayerFiltering, 
  testL6Hit, 
  extractLastThreeDigits,
  LAYERS,
  Draw,
  AnalysisResult,
  ScoredNumber
} from "@/lib/lottery-core";

// LocalStorage Keys
const STORAGE_KEYS = {
  DRAWS: "lottery_draws",
  STATS: "lottery_stats",
  LAST_SYNC: "lottery_last_sync"
};

export default function Lottery() {
  const [loading, setLoading] = useState(false);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>("L6");
  const [stats, setStats] = useState({ total: 0, hits: 0, rate: 0 });

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedDraws = localStorage.getItem(STORAGE_KEYS.DRAWS);
    const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
    
    if (savedDraws) {
      const parsedDraws = JSON.parse(savedDraws);
      setDraws(parsedDraws);
      runAnalysis(parsedDraws);
    } else {
      fetchData(); // Initial fetch if empty
    }

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // 2. Fetch Data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to fetch real data
      const response = await fetch("https://myip.xigoodone.workers.dev/api/lottery");
      if (!response.ok) throw new Error("API response not ok");
      const data = await response.json();
      
      const newDraws = Array.isArray(data) ? data : [data];
      if (newDraws.length > 0) {
        setDraws(newDraws);
        localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(newDraws));
        runAnalysis(newDraws);
      }
    } catch (error) {
      console.warn("API Fetch failed, using sample data for demo:", error);
      // Generate some realistic sample data if API fails
      const sampleDraws = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        number: `${Math.floor(Math.random() * 10)},${Math.floor(Math.random() * 10)},${Math.floor(Math.random() * 10)},${Math.floor(Math.random() * 10)}`,
        drawDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        period: (2024032000 + i).toString()
      }));
      setDraws(sampleDraws);
      localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(sampleDraws));
      runAnalysis(sampleDraws);
    } finally {
      setLoading(false);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
  };

  // 3. Run Analysis
  const runAnalysis = (drawData: Draw[]) => {
    const { hotDigits, coldDigits, keyCodes, codeFreq } = analyzeHistoryData(drawData);
    const scoredNumbers = calculateScores(hotDigits, coldDigits, keyCodes, codeFreq);
    const layerResults = performNineLayerFiltering(scoredNumbers, hotDigits, keyCodes);
    
    setAnalysis({
      hotDigits,
      coldDigits,
      keyCodes,
      codeFreq,
      scoredNumbers,
      layerResults
    });
  };

  // 4. Test Hit
  const testNewHit = (latestDraw: Draw) => {
    if (!analysis?.layerResults.L6) return;
    
    const isHit = testL6Hit(latestDraw.number, analysis.layerResults.L6);
    const newStats = {
      total: stats.total + 1,
      hits: stats.hits + (isHit ? 1 : 0),
      rate: 0
    };
    newStats.rate = (newStats.hits / newStats.total) * 100;
    
    setStats(newStats);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="text-blue-400" /> 彩票九层精筛系统
          </h1>
          <p className="text-slate-400 mt-1">实时数据同步与 AI 算法分析面板</p>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
          同步最新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Layers */}
        <div className="space-y-6">
          {/* Hit Rate Card */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">L6 命中统计</CardTitle>
              <Trophy className="text-yellow-500 w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.rate.toFixed(2)}%</div>
              <Progress value={stats.rate} className="h-2 bg-slate-800" />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>测试次数: {stats.total}</span>
                <span>命中次数: {stats.hits}</span>
              </div>
            </CardContent>
          </Card>

          {/* Layer Navigation */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> 筛选层级控制
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {LAYERS.map((layer) => (
                <Button
                  key={layer.id}
                  variant={activeLayer === layer.id ? "default" : "outline"}
                  className={`text-xs h-12 flex flex-col ${
                    activeLayer === layer.id 
                      ? "bg-purple-600 hover:bg-purple-700 border-none" 
                      : "border-slate-800 hover:bg-slate-800 text-slate-400"
                  }`}
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <span>{layer.id}</span>
                  <span className="opacity-50 text-[10px]">{analysis?.layerResults[layer.id]?.length || 0}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Hot/Cold Analysis */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" /> 冷热码分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">热码 (出现频率最高)</p>
                <div className="flex gap-2">
                  {analysis?.hotDigits.map(d => (
                    <Badge key={d} className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-3 py-1">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Key码 (核心推荐)</p>
                <div className="flex gap-2">
                  {analysis?.keyCodes.map(d => (
                    <Badge key={d} className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl min-h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-4">
              <div>
                <CardTitle className="text-lg">层级筛选结果: {activeLayer}</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  {LAYERS.find(l => l.id === activeLayer)?.desc}
                </p>
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                {analysis?.layerResults[activeLayer]?.length || 0} 组
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-950/50 sticky top-0 z-10">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">号码</TableHead>
                      <TableHead className="text-slate-400">和值</TableHead>
                      <TableHead className="text-slate-400">跨度</TableHead>
                      <TableHead className="text-slate-400">评分</TableHead>
                      <TableHead className="text-slate-400">包含Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis?.layerResults[activeLayer]?.map((item) => (
                      <TableRow key={item.num} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell className="font-mono text-blue-400 text-lg">{item.num}</TableCell>
                        <TableCell>{item.sum}</TableCell>
                        <TableCell>{item.span}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {item.totalScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.containsKeyCode ? (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* History Section */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> 最近开奖记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {draws.slice(0, 5).map((draw) => (
                  <div key={draw.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-slate-500 mb-1">{draw.period}</span>
                    <span className="text-xl font-bold text-white tracking-widest">{extractLastThreeDigits(draw.number)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

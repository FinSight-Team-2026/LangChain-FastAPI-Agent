import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, getPriceColorClass, getSentimentMeta } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stocks,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStocks = stocks.filter((stock) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      stock.name.toLowerCase().includes(q) ||
      stock.code.includes(q) ||
      stock.sector.toLowerCase().includes(q) ||
      stock.keyDrivers.some((d) => d.toLowerCase().includes(q))
    );
  });

  const handleToggleWatchlist = (e: React.MouseEvent, stock: Stock) => {
    e.stopPropagation();
    const added = toggleWatchlist(stock.id);
    if (added) {
      showToast(`${stock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast(`${stock.name}이(가) 관심 종목에서 삭제되었습니다.`, 'info');
    }
  };

  const handleSelect = (stock: Stock) => {
    onSelectStock(stock);
    onClose();
  };

  const popularKeywords = ['삼성전자', 'SK하이닉스', '알테오젠', '삼양식품', '한화에어로스페이스'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명 또는 종목코드 검색 (예: 삼성전자, 005930, 알테오젠)"
            className="w-full text-sm sm:text-base font-medium outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            취소
          </button>
        </div>

        {/* Popular Keywords Bar if no query */}
        {!query && (
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">추천 검색:</span>
            {popularKeywords.map((k) => (
              <button
                key={k}
                onClick={() => setQuery(k)}
                className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0"
              >
                {k}
              </button>
            ))}
          </div>
        )}

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredStocks.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p className="text-sm">검색 결과가 없습니다.</p>
              <p className="text-xs mt-1">종목명이나 6자리 종목코드를 다시 확인해주세요.</p>
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isWatched = isInWatchlist(stock.id);
              const sentimentMeta = getSentimentMeta(stock.sentimentScore);

              return (
                <div
                  key={stock.id}
                  onClick={() => handleSelect(stock)}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {stock.name}
                      </span>
                      <span className="text-xs text-slate-400 num-font">{stock.code}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                        {stock.market}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {stock.sector} · {stock.sentimentSummary[0]}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-sm font-bold text-slate-900 num-font">
                        {formatPrice(stock.price)}
                      </div>
                      <div className={`text-xs font-semibold num-font ${getPriceColorClass(stock.changeRate)}`}>
                        {formatChangeRate(stock.changeRate)}
                      </div>
                    </div>

                    {/* AI Score */}
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span className={`text-xs font-bold ${sentimentMeta.textColor} num-font`}>
                          {stock.sentimentScore}점
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{sentimentMeta.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleWatchlist(e, stock)}
                      className={`p-2 rounded-xl transition-all ${
                        isWatched
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                      }`}
                      title={isWatched ? '관심종목 해제' : '관심종목 추가'}
                    >
                      <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

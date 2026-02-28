import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { Trophy, Flame, Star, Users, Sparkles, Loader2, Medal, Crown } from 'lucide-react';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

function ActiveChallenges({ challenges }) {
  const active = challenges?.filter((c) => c.status === 'active') || [];
  if (!active.length) return null;

  return (
    <Card title="Active Challenges">
      <div className="space-y-4">
        {active.map((ch) => {
          const pct = Math.round((ch.progress / ch.duration) * 100);
          return (
            <div key={ch.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-700">{ch.title}</h4>
                <span className="text-xs text-purple-600 font-medium">+{ch.xpReward} XP</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{ch.description}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Day {ch.progress}/{ch.duration}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ch.participants} participants
                </span>
                <span className="text-emerald-600 font-medium">Save ${ch.potentialSaving}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AvailableChallenges({ challenges, suggestions, suggestionsLoading }) {
  const available = challenges?.filter((c) => c.status === 'available') || [];

  return (
    <Card title="Available Challenges">
      <div className="space-y-3">
        {suggestionsLoading && (
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
            <span className="text-xs text-purple-600">AI generating personalized challenges...</span>
          </div>
        )}
        {suggestions?.suggestedChallenges?.map((ch, i) => (
          <div key={`ai-${i}`} className="p-3 border border-purple-200 bg-purple-50/50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-[10px] text-purple-500 font-medium">AI Suggested For You</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-slate-700">{ch.title}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[ch.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                {ch.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{ch.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-purple-600 font-medium">+{ch.xpReward} XP</span>
                <span className="text-emerald-600 font-medium">Save ${ch.potentialSaving}</span>
              </div>
              <button className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700">
                Join
              </button>
            </div>
          </div>
        ))}
        {available.map((ch) => (
          <div key={ch.id} className="p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-slate-700">{ch.title}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[ch.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                {ch.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{ch.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ch.participants}</span>
                <span className="text-emerald-600 font-medium">Save ${ch.potentialSaving}</span>
                <span className="text-purple-600 font-medium">+{ch.xpReward} XP</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Leaderboard({ data }) {
  if (!data?.length) return null;
  const RANK_STYLE = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

  return (
    <Card title="Community Leaderboard">
      <div className="space-y-2">
        {data.map((user, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${
              user.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
            }`}
          >
            <span className={`text-lg font-bold w-6 text-center ${RANK_STYLE[i] || 'text-slate-400'}`}>
              {user.rank}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-white">
              {user.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                {user.name} {user.isCurrentUser && <span className="text-xs text-blue-500">(You)</span>}
              </p>
              <p className="text-xs text-slate-400">Level {user.level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-purple-600">{user.xp.toLocaleString()} XP</p>
              <p className="text-xs text-slate-400 flex items-center gap-0.5 justify-end">
                <Flame className="w-3 h-3 text-orange-400" />{user.streak} days
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Challenges() {
  const { data: challenges, loading: challengesLoading } = useApi(api.challenges.getAll, []);
  const { data: leaderboard, loading: lbLoading } = useApi(api.challenges.getLeaderboard, []);
  const { data: suggestions, loading: suggestionsLoading } = useApi(api.challenges.getSuggestions, []);

  if (challengesLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton lines={2} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton lines={8} />
          <Skeleton lines={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Challenges
        </h2>
        <p className="text-sm text-slate-500">Complete challenges to earn XP and save money</p>
      </div>

      <ActiveChallenges challenges={challenges} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AvailableChallenges
          challenges={challenges}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
        />
        <Leaderboard data={leaderboard} />
      </div>
    </div>
  );
}

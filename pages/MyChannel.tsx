import React from 'react';
import { MY_VIDEOS } from '../constants';
import { DashboardCard } from '../components/DashboardCard';
import { Eye, ThumbsUp, MessageCircle, MousePointerClick, Clock } from 'lucide-react';

export const MyChannel: React.FC = () => {
  return (
    <div className="pb-12 space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">Channel Performance</h2>
           <p className="text-gray-500">Your latest videos analyzed against your baseline.</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 outline-none focus:border-emerald-500">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DashboardCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Performance</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Views</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">CTR</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">AVD</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MY_VIDEOS.map((video) => (
                  <tr key={video.video_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <img src={video.thumbnail_url} alt="" className="w-24 h-14 rounded-lg object-cover shadow-sm" />
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm max-w-md truncate">{video.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{video.published_at}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                            ${video.performance_tier === 'Elite' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              video.performance_tier === 'Strong' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              video.performance_tier === 'Weak' ? 'bg-red-50 text-red-600 border border-red-100' :
                              'bg-gray-100 text-gray-500'
                            }
                        `}>
                            {video.performance_tier}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-700 font-medium">
                            <Eye size={14} className="text-gray-400" />
                            {video.views.toLocaleString()}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1.5 text-gray-700 font-medium">
                            <MousePointerClick size={14} className="text-gray-400" />
                            {video.ctr}%
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1.5 text-gray-700 font-medium">
                            <Clock size={14} className="text-gray-400" />
                            {video.avg_view_duration}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">{video.outlier_score}x</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
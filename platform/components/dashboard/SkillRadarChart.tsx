'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSkillStatsQuery } from '@/hooks/queries/useExamQueries';
import { Skeleton } from '@/components/ui/skeleton';

export function SkillRadarChart() {
  const { data: stats, isLoading } = useUserSkillStatsQuery();

  if (isLoading) {
    return (
      <Card className="col-span-1 bg-black/40 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  // Fallback data if user hasn't taken enough exams
  const displayData = stats && stats.length >= 3 ? stats : [
    { skill: 'Logic', average: 0, fullMark: 100 },
    { skill: 'Coding', average: 0, fullMark: 100 },
    { skill: 'Architecture', average: 0, fullMark: 100 },
    { skill: 'Frontend', average: 0, fullMark: 100 },
    { skill: 'Backend', average: 0, fullMark: 100 }
  ];

  return (
    <Card className="col-span-1 bg-black/40 border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500 overflow-hidden group">
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Verified Skill Matrix
        </CardTitle>
        <CardDescription className="text-white/40">
          Your proficiency based on verified assessment performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="h-[300px] p-0 relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] group-hover:bg-blue-500/10 transition-all duration-500" />
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayData}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#ffffff60', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Proficiency"
              dataKey="average"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              animationBegin={0}
              animationDuration={1500}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#000000ee', 
                borderColor: '#ffffff10',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#3b82f6' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {stats && stats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 text-center">
            <p className="text-sm text-white/60">
              Complete at least 3 assessments to generate your verified skill matrix.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContentChunk } from '@/lib/types/api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [chunks, setChunks] = useState<ContentChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.error);
      }

      // Update this section to match new API response format
      if (data.results) {
        setChunks(data.results.map((result: any, index: number) => ({
          id: index.toString(),
          content: result.text,
          score: result.score
        })));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [url, query]);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Website Content Scraper
            </h1>
          </div>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-purple-900/50 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-purple-400" />
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required={true}  // Update to always require URL
                    className="flex-1 border-purple-900/50 placeholder:text-purple-400/70 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border-purple-900/50 placeholder:text-blue-400/70 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  'Extract Content'
                )}
              </Button>
            </form>
          </Card>

          {/* Results Section */}
          {chunks.length > 0 && (
            <Tabs defaultValue="cards" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-lg border-purple-900/50 h-12">
                <TabsTrigger 
                  value="cards" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-purple-300 transition-colors"
                >
                  Cards View
                </TabsTrigger>
                <TabsTrigger 
                  value="table" 
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-blue-300 transition-colors"
                >
                  Table View
                </TabsTrigger>
              </TabsList>
              
              {/* Cards View */}
              <TabsContent value="cards" className="mt-6">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {chunks.map((chunk) => (
                    <Card 
                      key={chunk.id} 
                      className="p-5 bg-white/5 backdrop-blur-lg border-purple-900/50 hover:border-purple transition-colors group"
                    >
                      <p className="text-sm text-purple leading-relaxed group-hover:text-purple transition-colors">
                        {chunk.content}
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Table View */}
              <TabsContent value="table">
                <Card className="bg-white/5 backdrop-blur-lg border-purple-900/50 shadow-lg">
                  <Table className="border-collapse w-full">
                    <TableHeader className="bg-purple-900/20">
                      <TableRow className="border-purple-900/50">
                        <TableHead className="text-purple py-4 w-[100px]">ID</TableHead>
                        <TableHead className="text-blue">Content</TableHead>
                        <TableHead className="text-green text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chunks.map((chunk) => (
                        <TableRow 
                          key={chunk.id} 
                          className="border-purple-900/50 hover:bg-purple-900/10 transition-colors"
                        >
                          <TableCell className="text-purple font-medium py-3">
                            {chunk.id}
                          </TableCell>
                          <TableCell className="text-purple py-3">
                            {chunk.content}
                          </TableCell>
                          <TableCell className="text-green-300 py-3 text-right">
                            {chunk.score.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
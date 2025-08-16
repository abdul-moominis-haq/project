'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2,
  User,
  Calendar,
  Tag,
  Filter,
  TrendingUp,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { dummyCommunityPosts } from '@/lib/dummy-data';
import { CommunityPost, Reply } from '@/types';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(dummyCommunityPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newReply, setNewReply] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');

  // Enhanced filtering and search
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || post.tags.includes(filterBy);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'discussed':
        return b.replies.length - a.replies.length;
      default:
        return 0;
    }
  });

  const handleAddPost = () => {
    if (!newPost.trim()) return;

    const tags = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newPost,
      date: new Date().toISOString(),
      likes: 0,
      replies: [],
      tags: tags.length > 0 ? tags : ['general']
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setNewPostTitle('');
    setNewPostTags('');
    setIsNewPostOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            replies: post.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, likes: reply.likes + 1 }
                : reply
            )
          }
        : post
    ));
  };

  const handleAddReply = (postId: string) => {
    if (!newReply.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newReply,
      date: new Date().toISOString(),
      likes: 0
    };

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, replies: [...post.replies, reply] }
        : post
    ));
    
    setNewReply('');
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Farmer Community</h1>
          <p className="text-gray-600 text-sm sm:text-base">Share knowledge and connect with fellow farmers</p>
        </div>

        {/* Enhanced Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search discussions, users, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="popular">Most Liked</SelectItem>
                      <SelectItem value="discussed">Most Discussed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="tomatoes">Tomatoes</SelectItem>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="pest-control">Pest Control</SelectItem>
                      <SelectItem value="fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="weather">Weather</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        New Discussion
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg mx-4 sm:mx-auto">
                      <DialogHeader>
                        <DialogTitle>Start a New Discussion</DialogTitle>
                        <DialogDescription>
                          Share your knowledge, ask questions, or discuss farming topics with the community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Discussion Topic</label>
                          <Input
                            placeholder="Brief title for your discussion..."
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Your Message</label>
                          <Textarea
                            placeholder="Share your thoughts, ask questions, or provide advice..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Tags</label>
                          <Input
                            placeholder="e.g., maize, irrigation, pest-control (comma separated)"
                            value={newPostTags}
                            onChange={(e) => setNewPostTags(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">Add relevant tags to help others find your discussion</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddPost} disabled={!newPost.trim()}>
                          Post Discussion
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Quick topic filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 self-center">Popular topics:</span>
                {['maize', 'tomatoes', 'irrigation', 'pest-control', 'fertilizers'].map((topic) => (
                  <Button
                    key={topic}
                    variant={filterBy === topic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterBy(filterBy === topic ? 'all' : topic)}
                    className="text-xs"
                  >
                    #{topic}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Community Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{filteredPosts.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {searchQuery || filterBy !== 'all' ? 'Filtered' : 'Total'} Discussions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">156</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {filteredPosts.reduce((sum, post) => sum + post.likes + post.replies.reduce((replySum, reply) => replySum + reply.likes, 0), 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {filteredPosts.reduce((sum, post) => sum + post.replies.length, 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Replies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 sm:col-span-3 lg:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">
                    {Array.from(new Set(posts.flatMap(post => post.tags))).length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Unique Topics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Posts Display */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterBy !== 'all' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Be the first to start a discussion!"
                  }
                </p>
                {!searchQuery && filterBy === 'all' && (
                  <Button onClick={() => setIsNewPostOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.author}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.date)}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                  
                  {/* Enhanced Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 px-2 hover:bg-green-50 hover:border-green-300"
                        onClick={() => setFilterBy(tag)}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>

                  {/* Enhanced Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={`text-gray-600 hover:text-red-600 transition-colors ${post.likes > 0 ? 'text-red-600' : ''}`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.likes > 0 ? 'fill-current' : ''}`} />
                        {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                      </Button>
                      
                      <span className="text-xs text-gray-500">
                        {post.replies.reduce((sum, reply) => sum + reply.likes, 0)} reply likes
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {post.replies.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {post.replies.length} conversation{post.replies.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Replies Section */}
                  {selectedPost === post.id && (
                    <div className="mt-6 space-y-4 border-t pt-6">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Replies ({post.replies.length})</span>
                      </h4>
                      
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                              <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeReply(post.id, reply.id)}
                              className={`text-xs transition-colors ${reply.likes > 0 ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${reply.likes > 0 ? 'fill-current' : ''}`} />
                              {reply.likes}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                      
                      {/* Enhanced Reply Input */}
                      <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Reply as Current User</span>
                          </div>
                          <Textarea
                            placeholder="Share your thoughts or advice..."
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            rows={3}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {newReply.length}/500 characters
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(post.id)}
                              disabled={!newReply.trim() || newReply.length > 500}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
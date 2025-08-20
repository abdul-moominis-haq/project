import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { communityService } from '@/services/database'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get posts
    const posts = await communityService.getPosts(limit, offset)
    
    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Error in community GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the post data from request body
    const postData = await request.json()
    
    // Validate required fields
    if (!postData.title || !postData.content) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content' 
      }, { status: 400 })
    }

    // Create post
    const newPost = await communityService.createPost({
      user_id: user.id,
      title: postData.title,
      content: postData.content,
      post_type: postData.post_type || 'discussion',
      tags: postData.tags,
      images: postData.images,
      location: postData.location,
      is_featured: false,
      is_published: true,
      crop_related: postData.crop_related
    })

    if (newPost) {
      return NextResponse.json({
        success: true,
        message: 'Post created successfully',
        post: newPost
      })
    } else {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in community POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

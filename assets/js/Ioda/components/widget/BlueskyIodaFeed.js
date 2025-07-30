import React, { useEffect, useState } from 'react';
import PostCard from "./PostCard";

const BlueskyIodaFeed = ({ did }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserFeed = async () => {
            try {
                const response = await fetch(
                    `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${did}&limit=5`
                );
                if (!response.ok) {
                    throw new Error(`Error fetching feed: ${response.statusText}`);
                }
                const data = await response.json();
                setPosts(data.feed || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserFeed();
    }, [did]);

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {posts.map((postItem, index) => {
                const post = postItem.post;
                const { text, createdAt } = post.record;
                const rkey = post.uri?.split('/').pop();
                const postUrl = `https://bsky.app/profile/${did}/post/${rkey}`;
                const imageUrl = post.embed?.images?.[0]?.thumb;

                return (
                    <PostCard
                        key={index}
                        text={text}
                        createdAt={new Date(createdAt).toLocaleString()}
                        postUrl={postUrl}
                        avatar={post.author?.avatar}
                        displayName={post.author?.displayName}
                        handle={post.author?.handle}
                        imageUrl={imageUrl}
                        likeCount={post.likeCount}
                        replyCount={post.replyCount}
                    />
                );
            })}
        </div>
    );
};

export default BlueskyIodaFeed;

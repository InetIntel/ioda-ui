import React from 'react';
const PostCard = ({
                      text,
                      createdAt,
                      postUrl,
                      avatar,
                      displayName,
                      handle,
                      imageUrl,
                      likeCount,
                      replyCount
                  }) => {

    const createdAtFormatted = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="user-details">
                    <a href="https://bsky.app/profile/ioda.live" className="mt-post-avatar"
                       rel="nofollow noopener noreferrer" target="_blank">
                        <img src={avatar} alt={`${displayName}'s avatar`} className="avatar"/>
                        <div className="user-info">
                            {/*<span className="display-name">{displayName}</span>*/}
                            <span className="display-name">IODA</span>
                            <span className="handle">@{handle}</span>
                        </div>
                    </a>
                </div>
                <div className="post-date">{createdAtFormatted}</div>
        </div>

    <div className="post-content">
        <p className="post-text">{text}</p>
                {imageUrl && <img src={imageUrl} alt="Post attachment" className="post-image"/>}
            </div>
            <div className="post-footer">
                <div className="engagement">
                    <span>❤️ {likeCount}</span>
                    <span>💬 {replyCount}</span>
                </div>
                <a href={postUrl} target="_blank" rel="noopener noreferrer" className="post-link">
                    View on Bluesky →
                </a>
            </div>
        </div>

    );
};

export default PostCard;
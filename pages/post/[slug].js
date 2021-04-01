import styles from '../../styles/Post.module.css'
import { useState, useEffect } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import BlockContent from '@sanity/block-content-to-react'
import Toolbar from '../../components/Toolbar'

export const Post = ({ post, author, category }) => {
    const [imageUrl, setImageUrl] = useState('')
    useEffect(() => {
        const imgBuilder = imageUrlBuilder({
            projectId: 'as3fopdi',
            dataset: 'production'
        });
        setImageUrl(imgBuilder.image(post.mainImage))
    }, [post.mainImage])

    return (
        <div>
            <Toolbar />
            <div className={styles.main}>
                <h1>{post.title}</h1>
                {imageUrl && <img src={imageUrl} className={styles.mainImage} />}
                <div className={styles.body}>
                    <div className={styles.aside}>
                        {post.publishedAt &&
                            <span className="asideDate">Published: {post.publishedAt.substr(0, 10)}</span>
                        }
                        <span className="asideAuthor">By: {author.name}</span>
                        <span className="asideCategory">Title: {category.title}</span>
                    </div>
                    <BlockContent blocks={post.body} />
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps = async pageContext => {
    const pageSlug = pageContext.query.slug;
    if (!pageSlug) {
        return {
            notFound: true
        }
    }

    const query = encodeURIComponent(`*[ _type == "post" && slug.current == "${pageSlug}"]`)
    const url = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=${query};`
    const authorURL = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=*%5B_type%20%3D%3D%20%22author%22%5D`
    const categoryURL = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=*%5B_type%20%3D%3D%20%22category%22%5D`

    const result = await fetch(url).then(res => res.json());
    const post = result.result[0]

    const autResult = await fetch(authorURL).then(res => res.json());
    const autPost = autResult.result[1]

    const categoryResult = await fetch(categoryURL).then(res => res.json());
    const categoryPost = categoryResult.result[0]

    if (!post) {
        return {
            notFound: true
        }
    }
    else {
        return {
            props: {
                post: post,
                author: autPost,
                category: categoryPost
            }
        }
    }
}
export default Post

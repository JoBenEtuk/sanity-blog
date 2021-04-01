import imageUrlBuilder from '@sanity/image-url'
import BlockContent from '@sanity/block-content-to-react'
import Toolbar from '../components/Toolbar'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
export default function Home({ posts, author, category }) {

  const [mappedPosts, setMappedPosts] = useState([])
  const router = useRouter()
  console.log(mappedPosts)
  useEffect(() => {
    if (posts.length) {
      const imgBuilder = imageUrlBuilder({
        projectId: 'as3fopdi',
        dataset: 'production'
      });
      setMappedPosts(
        posts.map(p => {
          return {
            ...p,
            mainImage: imgBuilder.image(p.mainImage).width(500).height(250)
          }
        })
      )
    }
    else {
      setMappedPosts([])
    }
  }, [posts])
  return (
    <div>
      <Toolbar />
      <div className={styles.main}>
        <h1>Welcome To My Blog</h1>
        <h3>Recent Post:</h3>
      </div>
      <div className={styles.feed}>
        {mappedPosts.length ?
          mappedPosts.map((p, index) => (
            <article onClick={() => router.push(`/post/${p.slug.current}`)} key={index} className={styles.post}>
              <img className={styles.mainImage} src={p.mainImage} alt="" />
              <aside>
                <h3>{p.title}</h3>
                <div className={styles.aside}>
                  {p.publishedAt &&
                    <span className="asideDate">{p.publishedAt.substr(0, 10)}</span>
                  }
                  <span className="asideAuthor">{author.name}</span>
                  <span className="asideCategory">{category.title}</span>
                </div>
              </aside>
            </article>
          )) :
          <> No Posts Yet</>}
      </div>
    </div>
  )
}

export const getServerSideProps = async pageContext => {
  const query = encodeURIComponent(`*[_type=="post"]`)
  const url = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=${query};`
  const authorURL = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=*%5B_type%20%3D%3D%20%22author%22%5D`
  const categoryURL = `https://as3fopdi.api.sanity.io/v1/data/query/production?query=*%5B_type%20%3D%3D%20%22category%22%5D`
  const result = await fetch(url).then(res => res.json());

  const autResult = await fetch(authorURL).then(res => res.json());
  const autPost = autResult.result[1]

  const categoryResult = await fetch(categoryURL).then(res => res.json());
  const categoryPost = categoryResult.result[0]

  if (!result.result || !result.result.length) {
    return {
      props: {
        posts: []
      }
    }
  } else {
    return {
      props: {
        posts: result.result,
        author: autPost,
        category: categoryPost
      }
    }
  }
}

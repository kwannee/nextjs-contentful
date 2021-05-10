import {createClient} from 'contentful'
import Image from 'next/image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Skeleton from '../../components/Skeleton';

const client = createClient({
    //그냥 하면 github에 공개되니까 환경변수 사용해서 한다.
    //환경변수 사용하면 숨길 수 있다.
    space:process.env.CONTENTFUL_SPACE_ID,
    accessToken:process.env.CONTENTFUL_ACCESS_KEY,
})

export const getStaticPaths = async () => {
    const res = await client.getEntries({
        content_type:'recipe'
    })
    const paths = res.items.map(item=>{
        return {
            params:{slug:item.fields.slug}
        }
    })
    return{
        //fallback - 없는 페이지 접근하면 어떻게 대응하냐 하는것. false면 404
        //revalidate해서 새로운 페이지가 생겨났을때 fallback이 false면 그 페이지는 404가 뜬다.
        paths,
        fallback:true
    }
}

export async function getStaticProps({params}) {
    const {items} = await client.getEntries({
        content_type:'recipe',
        'fields.slug':params.slug
    })
    return{
        props:{
            recipe:items[0]
        },
        revalidate:1
    }
}

export default function RecipeDetails({recipe}) {

    if(!recipe) return <Skeleton />

    const {featuredImage,title,cookingTime,ingredients,method} = recipe.fields
    return (
        <div>

            <div className="banner">
                <Image
                  src={"https:"+featuredImage.fields.file.url}
                  width={featuredImage.fields.file.details.image.width}
                  height={featuredImage.fields.file.details.image.height}
                />
                <h2>{ title }</h2>
            </div>

            <div className="info">
                <p>Take about { cookingTime } mins to cook.</p>
                <h3>ingredients:</h3>
                {ingredients.map(ing=>(
                    <span key={ing}>{ing}</span>
                ))}
            </div>

            <div className="method">
                <h3>Method:</h3>
                <div>{documentToReactComponents(method)}</div>
            </div>

            <style jsx>{`
                h2,h3 {
                text-transform: uppercase;
                }
                .banner h2 {
                margin: 0;
                background: #fff;
                display: inline-block;
                padding: 20px;
                position: relative;
                top: -60px;
                left: -10px;
                transform: rotateZ(-1deg);
                box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
                }
                .info p {
                margin: 0;
                }
                .info span::after {
                content: ", ";
                }
                .info span:last-child::after {
                content: ".";
                }
                .method{
                    word-break:break-all;
                }
            `}</style>
        </div>
    )
}
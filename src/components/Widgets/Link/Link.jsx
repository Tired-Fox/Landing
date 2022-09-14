import { h, Fragment } from 'preact';
import './link.scss';

export function Link({ ...props }) {
    const { color, title, name, href, children } = props;

    return (
        <>
            <div
                class="link"
                title={title ? title : name}
                onClick={(e) => {
                    console.log("Hello World");
                    window.open(href, "_blank");
                }}>
                {children}
                {/* <p class="small"><strong>{name}</strong></p> */}
            </div>
        </>
    )
}
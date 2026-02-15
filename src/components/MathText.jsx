import { useEffect, useRef } from 'react'

export default function MathText({ text }) {
    const containerRef = useRef(null)

    useEffect(() => {
        if (containerRef.current && window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            })
        }
    }, [text])

    return <span ref={containerRef}>{text}</span>
}

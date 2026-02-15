import React from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught error:', error, errorInfo)
        this.setState({ errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <div style={{ margin: '20px 0', padding: 20, background: '#fee', border: '1px solid #fcc', borderRadius: 8, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                        <h3 style={{ marginTop: 0 }}>Error: {this.state.error && this.state.error.toString()}</h3>
                        <details style={{ marginTop: 10 }}>
                            <summary>Stack Trace</summary>
                            <pre style={{ fontSize: '0.8em', overflowX: 'auto', padding: 10, background: '#fff' }}>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                    <br /><br />
                    <a href="/" style={{ color: 'blue' }}>Go back to Home</a>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary

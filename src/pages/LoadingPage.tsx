const LoadingPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 500, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    );
}
export default LoadingPage;
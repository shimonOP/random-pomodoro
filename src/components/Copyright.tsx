const Copyright = () => {
    return (
        <div className="text-sm text-base-content/70 text-center">
            {'Copyright © '}
            <a className="link" href="#">
                All Right Reserved
            </a>{' '}
            {new Date().getFullYear()}
            {'.'}
        </div>
    );
}
export default Copyright;
import "./AuthLoading.css";
import logo from "../../assets/abn-logo.png";
function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-loading__content">
        <div className="auth-loading__logo-wrap">
          <div className="auth-loading__ring" />

          <img src={logo} alt="ABN Fleet" className="auth-loading__logo" />
        </div>

        <div className="auth-loading__dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default AuthLoading;

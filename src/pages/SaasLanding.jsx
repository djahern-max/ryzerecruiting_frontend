import sendInviteIcon from '../assets/icons/send_invite.svg';
import ZoomIcon from '../assets/icons/zoom.svg';

const SaasLanding = () => {
    return (
        <div>
            <img src={sendInviteIcon} alt="Send Invite" />
            <p>Step 1: Send meeting invite to potential candidates or employers</p>
            <img src={ZoomIcon} alt="Zoom" />
            <p>Step 2: Conduct the interview on Zoom and record it</p>
        </div>
    );
};

export default SaasLanding;
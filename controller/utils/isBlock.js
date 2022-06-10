const blockUser = (user)=>{
    if(user.isBlocked){
        throw new Error(`Access denied , ${user.firstname} is blocked`);
    }

};

module.exports  = blockUser;
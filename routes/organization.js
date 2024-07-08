import express from 'express';
import auth,{authorizeOrgMemberMutate} from '../middlewares/auth.js';
import organization from '../controllers/organization.js';


const router = express.Router();

/*-----------------------------------ORGANIZATION ROUTES----------------------------------------------------- */

router.post('/create',auth,organization.createOrg);
router.post('/add-member',auth,authorizeOrgMemberMutate, organization.addMembers);
router.post('/create-org',auth,organization.csvcreateOrg);
router.get('/:organizationId/members',auth,organization.getOrgMembers);
router.delete("/:organizationId/delete-member",auth,authorizeOrgMemberMutate,organization.deleteMember);
router.post("/:organizationId/update-role",auth,authorizeOrgMemberMutate,organization.editUserRole);
router.get("/",auth,organization.getAll);
router.delete("/:organizationId",auth,authorizeOrgMemberMutate,organization.deleteOrganization);


export default router;

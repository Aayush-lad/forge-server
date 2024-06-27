import express from 'express';
import auth from '../middlewares/auth.js';
import organization from '../controllers/organization.js';


const router = express.Router();

/*-----------------------------------ORGANIZATION ROUTES----------------------------------------------------- */

router.post('/create',auth,organization.createOrg);
router.post('/add-member',auth, organization.addMembers);
router.post('/create-org',auth,organization.csvcreateOrg);
router.get('/:organizationId/members',organization.getOrgMembers);
router.delete("/:organizationId/delete-member",organization.deleteMember);
router.post("/:organizationId/update-role",organization.editUserRole);
router.get("/",auth,organization.getAll);
router.delete("/:organizationId",organization.deleteOrganization);


export default router;

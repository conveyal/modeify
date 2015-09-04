import createRouter from '../model-router'
import Org from './model'
import stormpath from '../stormpath'

/**
 * Expose `router`
 */

module.exports = createRouter({
  middleware: [stormpath.authenticationRequired, stormpath.groupsRequired(['administrator', 'manager'])],
  model: Org
}, function (router, byId) {

  // Default get one
  router.get('/:id', adminOrOrgManager, byId, function (req, res) {
    res.status(200).send(req.organization)
  })

  function adminOrOrgManager (req, res, next) {
    stormpath.groupsRequired(['administrator', `organization-${req.params.id}-manager`], false)(req, res, next)
  }

  router.post('/', stormpath.groupsRequired(['administrator']), function (req, res) {
    let org = null
    Org
      .create(req.body)
      .then(newOrg => {
        org = newOrg
        return stormpath.createGroups([`organization-${org._id}`, `organization-${org._id}-manager`])
      })
      .then(groups => {
        res.status(201).send(org)
      })
      .catch(err => {
        if (err.name === 'MongoError' && err.code === 11000) {
          res.status(409).send('Resource exists with that information.')
        } else {
          res.status(400).send(err)
        }
      })
  })

  /**
   * Update an org
   */

  router.put('/:id', byId, function (req, res) {
    req.organization.name = req.body.name
    req.organization.address = req.body.address
    req.organization.city = req.body.city
    req.organization.state = req.body.state
    req.organization.zip = req.body.zip
    req.organization.labels = req.body.labels
    req.organization.opts = req.body.opts
    req.organization.main_url = req.body.main_url
    req.organization.logo_url = req.body.logo_url
    req.organization.contact = req.body.contact
    req.organization.email = req.body.email
    req.organization.coordinate = req.body.coordinate
    req.organization.save(function (err) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })
})

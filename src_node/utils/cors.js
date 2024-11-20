const allowedDomains = process.env.ALLOWED_ORIGINS?.split(',') ?? '*';

/**
 *
 * @param {String} origin The origin that the request owns
 * @returns {Boolean} Returns true if the domains origin is allowed, otherwise returns false
 */
const isDomainAllowed = origin => {
  const domainParts = origin?.split('.') ?? '*';
  const domain =
    domainParts !== '*'
      ? `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`
      : '*';

  // console.log({ origin, domain, allowedDomains, isAllowed: allowedDomains === '*' || allowedDomains.includes(domain) })

  return allowedDomains === '*' || allowedDomains.includes(domain);
};

/**
 *
 * @param {Response} res
 * @param {String} origin
 */
const setHeaders = (res, origin) => {
  res.header('Access-Control-Allow-Origin', origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
};

const Cors = {
  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns
   */
  preflight: (req, res, next) => {
    const origin = req.headers.origin;
    if (isDomainAllowed(origin)) {
      setHeaders(res, origin);
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Preflight request is successful
      }
      next(); // Continue to the next middleware or route handler
    } else {
      return res.status(403).json({ message: 'Forbidden: Domain not allowed' }); // Return 403 if domain is not authorized
    }
  },
  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   */
  options: (req, res) => {
    const origin = req.headers.origin;
    if (isDomainAllowed(origin)) {
      setHeaders(res, origin);
      return res.sendStatus(200);
    }
    return res.sendStatus(403);
  },
};

export default Cors;
